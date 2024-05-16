from datetime import timedelta

import requests
import random
import time
import socket
import uuid
import json
import logging

from smbus2 import SMBus
from bme280 import BME280

bus = SMBus(1)
bme280 = BME280(i2c_dev=bus)

deviceUid = ""
ipAddress = ""
hostname = ""
serverIp = "192.168.1.117"
calibrationEnabled = True

logFormatter = logging.Formatter("%(asctime)s [%(threadName)-12.12s] [%(levelname)-5.5s]  %(message)s")
logger = logging.getLogger()

logPath = "logs"
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
        f = open('/proc/cpuinfo', 'r')
        for line in f:
            if line[0:6] == 'Serial':
                cpuserial = line[10:26]
        f.close()
    except:
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
    uidString = str(generateDeviceUid())
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
    s.connect(('192.168.1.0', 1))
    return s.getsockname()[0]

def getHostname():
    return socket.gethostname()

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
            logger.info("Registration outcome: " + response['result'])
            connected = True
        except Exception as e:
            sleep_time = connection_attempts * connection_attempts
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
    ipAddress = getIpAddress()
    hostname = getHostname()
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

if __name__ == "__main__":
    initialise()
    registerWithHub()
    calibrate()
    beginDataStreaming()
