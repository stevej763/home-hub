from datetime import timedelta

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
serverIp = "home-hub"
calibrationEnabled = True

logFormatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
logger = logging.getLogger()

logPath = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
fileName = "sensor_logs"
fileHandler = logging.FileHandler("{0}/{1}.log".format(logPath, fileName))
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
    for i in range(5):
        logger.info(f"Calibration iteration: {i + 1}")
        temperature = bme280.get_temperature()
        pressure = bme280.get_pressure()
        humidity = bme280.get_humidity()
        logger.info(f"{temperature:05.2f}°C {pressure:05.2f}hPa {humidity:05.2f}%")
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
    logger.info("Sending data temperature=%s pressure=%s humidity=%s", temperature, pressure, humidity)
    response = requests.post(url="http://{0}:3001/measurement/record".format(serverIp), json=data)
    logger.info("Response: %s", response.json())

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
            registration = requests.post(url="http://{0}:3001/devices/register".format(serverIp), json=registration_data)
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
                logger.info("Current status: %s. Not sending data", status)
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
    response = requests.get(url=("http://{0}:3001/devices/status/{1}".format(serverIp, deviceUid)))
    logger.info("response %s", response.json())
    return response.json()['status']


def publishCalibration():
    logger.info("Publishing calibration")
    response = requests.post(url="http://{0}:3001/devices/status/calibrating/{1}".format(serverIp, deviceUid))
    print(response.text)

def publishReadyStatus():
    logger.info("Publishing ready status")
    response = requests.post(url="http://{0}:3001/devices/status/ready/{1}".format(serverIp, deviceUid))
    print(response.text)

def initHardware():
    global bus, bme280
    bus = SMBus(1)
    bme280 = BME280(i2c_dev=bus)

if __name__ == "__main__":
    initHardware()
    initialise()
    registerWithHub()
    calibrate()
    beginDataStreaming()
