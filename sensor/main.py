from datetime import timedelta
from logging.handlers import RotatingFileHandler

import requests
import random
import time
import socket
import uuid
import json
import logging
import os

from smbus2 import SMBus
from bme280 import BME280

bus = None
bme280 = None

deviceUid = ""
ipAddress = ""
hostname = ""
serverScheme = os.environ.get("SENSOR_SERVER_SCHEME", "http")
serverIp = os.environ.get("SENSOR_SERVER_IP", "home-hub")
serverPort = os.environ.get("SENSOR_SERVER_PORT", "3001").strip()
calibrationEnabled = True

REQUEST_TIMEOUT_SECONDS = 10

session = requests.Session()

def buildUrl(path):
    if serverPort:
        return "{0}://{1}:{2}{3}".format(serverScheme, serverIp, serverPort, path)
    return "{0}://{1}{2}".format(serverScheme, serverIp, path)

logFormatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
logger = logging.getLogger()

logPath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
fileName = "sensor_logs"
fileHandler = RotatingFileHandler("{0}/{1}.log".format(logPath, fileName), maxBytes=5 * 1024 * 1024, backupCount=3)
fileHandler.setFormatter(logFormatter)
consoleHandler = logging.StreamHandler()
consoleHandler.setFormatter(logFormatter)
logger.addHandler(fileHandler)
logger.addHandler(consoleHandler)
logging.basicConfig()
logger.setLevel(logging.INFO)

def get_serial():
    cpuserial = "0000000000000000"
    try:
        with open('/proc/cpuinfo', 'r') as f:
            for line in f:
                if line.startswith('Serial'):
                    cpuserial = line.split(':')[1].strip()
    except Exception:
        cpuserial = "ERROR000000000"

    return cpuserial

def calibrate():
    logger.info("Calibrating device...")
    publishCalibration()
    if not calibrationEnabled:
        logger.warning("Skipping calibration")
        publishReadyStatus()
        return
    completed = 0
    while completed < 5:
        try:
            logger.info(f"Calibration iteration: {completed + 1}")
            temperature = bme280.get_temperature()
            pressure = bme280.get_pressure()
            humidity = bme280.get_humidity()
            logger.info(f"{temperature:05.2f}°C {pressure:05.2f}hPa {humidity:05.2f}%")
            completed += 1
        except Exception as e:
            logger.warning("Calibration read failed, retrying error=%s", e)
        time.sleep(5)
    logger.info("Calibration complete")
    publishReadyStatus()

def getCurrentTemperature():
    return bme280.get_temperature()

def getCurrentPressure():
    return bme280.get_pressure()

def getCurrentHumidity():
    return bme280.get_humidity()

def getFormattedCurrentTemperature():
    reading = getCurrentTemperature()
    return "{0:.2f}".format(reading)

def getFormattedCurrentPressure():
    reading = getCurrentPressure()
    return "{0:.2f}".format(reading)


def getFormattedCurrentHumidity():
    reading = getCurrentHumidity()
    return "{0:.2f}".format(reading)

def generateDeviceUid():
    rd = random.Random()
    rd.seed(get_serial())
    return uuid.UUID(int=rd.getrandbits(128), version=4)

def sendData():
    uidString = deviceUid
    temperature = getFormattedCurrentTemperature()
    pressure = getFormattedCurrentPressure()
    humidity = getFormattedCurrentHumidity()
    data = {
        "device_uid": uidString,
        "temperature": temperature,
        "pressure": pressure,
        "humidity": humidity
    }
    logger.debug("Sending data temperature=%s pressure=%s humidity=%s", temperature, pressure, humidity)
    response = session.post(url=buildUrl("/measurement/record"), json=data, timeout=REQUEST_TIMEOUT_SECONDS)
    if not response.ok:
        logger.warning("Hub rejected measurement statusCode=%s body=%s", response.status_code, response.text)
    else:
        logger.debug("Response: %s", response.json())

def getIpAddress():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't actually send traffic (UDP) - just used to make the OS pick
        # the outbound interface/IP for the local network, regardless of subnet.
        s.connect(('8.8.8.8', 1))
        return s.getsockname()[0]
    finally:
        s.close()

def getHostname():
    return socket.gethostname()

MAX_RETRY_BACKOFF_SECONDS = 60

def registerWithHub():
    connection_attempts = 1
    connected = False
    logger.info("Registering with hub")
    registration_data = {
        'device_uid': deviceUid,
        'device_name': hostname,
        'ip_address': ipAddress
    }
    while not connected:
        logger.info("Sending registration data deviceUid=%s device_name=%s ipAddress=%s", deviceUid, hostname, ipAddress)
        try:
            registration = session.post(url=buildUrl("/devices/register"), json=registration_data, timeout=REQUEST_TIMEOUT_SECONDS)
            if not registration.ok:
                raise Exception("Hub returned statusCode={0} body={1}".format(registration.status_code, registration.text))
            response = json.loads(registration.text)
            if response.get('result') == 'success':
                logger.info("Registration outcome: " + response['result'])
                connected = True
            else:
                raise Exception("Hub rejected registration: {0}".format(response))
        except Exception as e:
            sleep_time = min(connection_attempts * connection_attempts, MAX_RETRY_BACKOFF_SECONDS)
            logger.warning("Failed to register device attemptNumber=%s error=%s", connection_attempts, e)
            connection_attempts += 1
            logger.info("Retrying in %s...", timedelta(seconds=sleep_time))
            time.sleep(sleep_time)


def beginDataStreaming():
    while True:
        try:
            status = getDeviceStatus()
            if (status == "ACTIVE"):
                sendData()
            else:
                logger.debug("Current status: %s. Not sending data", status)
        except Exception as e:
            logger.error("Failed to send data error=%s", e)
        time.sleep(5)

def initialise():
    global deviceUid
    global ipAddress
    global hostname
    deviceUid = str(generateDeviceUid())
    hostname = getHostname()

    connection_attempts = 1
    while not ipAddress:
        try:
            ipAddress = getIpAddress()
        except Exception as e:
            sleep_time = min(connection_attempts * connection_attempts, MAX_RETRY_BACKOFF_SECONDS)
            logger.warning("Failed to determine IP address attemptNumber=%s error=%s", connection_attempts, e)
            connection_attempts += 1
            time.sleep(sleep_time)

    logger.info("DeviceUid set to: " + deviceUid)
    logger.info("IP Address set to: " + ipAddress)
    logger.info("Hostname set to: " + hostname)
    time.sleep(2)

def getDeviceStatus():
    response = session.get(url=buildUrl("/devices/status/{0}".format(deviceUid)), timeout=REQUEST_TIMEOUT_SECONDS)
    if not response.ok:
        raise Exception("Failed to get device status statusCode={0} body={1}".format(response.status_code, response.text))
    body = response.json()
    logger.debug("response %s", body)
    return body['status']


def postStatusWithRetry(path, logLabel):
    connection_attempts = 1
    while True:
        try:
            response = session.post(url=buildUrl(path), timeout=REQUEST_TIMEOUT_SECONDS)
            if not response.ok:
                raise Exception("Hub returned statusCode={0} body={1}".format(response.status_code, response.text))
            logger.info("%s response: %s", logLabel, response.text)
            return
        except Exception as e:
            sleep_time = min(connection_attempts * connection_attempts, MAX_RETRY_BACKOFF_SECONDS)
            logger.warning("Failed to %s attemptNumber=%s error=%s", logLabel, connection_attempts, e)
            connection_attempts += 1
            time.sleep(sleep_time)

def publishCalibration():
    logger.info("Publishing calibration")
    postStatusWithRetry("/devices/status/calibrating/{0}".format(deviceUid), "Publish calibration")

def publishReadyStatus():
    logger.info("Publishing ready status")
    postStatusWithRetry("/devices/status/ready/{0}".format(deviceUid), "Publish ready status")

def initHardware():
    global bus, bme280
    connection_attempts = 1
    while bme280 is None:
        try:
            bus = SMBus(1)
            bme280 = BME280(i2c_dev=bus)
        except Exception as e:
            sleep_time = min(connection_attempts * connection_attempts, MAX_RETRY_BACKOFF_SECONDS)
            logger.warning("Failed to initialise hardware attemptNumber=%s error=%s", connection_attempts, e)
            connection_attempts += 1
            time.sleep(sleep_time)

if __name__ == "__main__":
    while True:
        try:
            initHardware()
            initialise()
            registerWithHub()
            calibrate()
            beginDataStreaming()
        except Exception as e:
            logger.error("Unhandled error in main loop, restarting error=%s", e)
            time.sleep(5)
