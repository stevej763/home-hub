#!/bin/bash
# setup.sh
set -e

sudo apt update -y
sudo apt upgrade -y
sudo apt install python3-pip vim git -y
sudo raspi-config nonint do_i2c 0

if [ ! -d weatherhub ]; then
  git clone https://github.com/stevej763/weatherhub.git
fi
cd weatherhub/sensor

mkdir -p logs
chmod 755 startup.sh

git rev-parse --short HEAD > version.txt

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example - edit SENSOR_SERVER_IP/SENSOR_SERVER_PORT if the hub isn't reachable at the defaults (home-hub/3001)"
fi

sudo pip install -r requirements.txt --break-system-packages

echo "Checking I2C sensor connectivity..."
if python3 -c "from smbus2 import SMBus; from bme280 import BME280; BME280(i2c_dev=SMBus(1))" 2>/dev/null; then
  echo "BME280 detected OK"
else
  echo "WARNING: could not read the BME280 over I2C yet. This is expected if I2C was just enabled for the first time - reboot and re-check with:"
  echo "  python3 -c \"from smbus2 import SMBus; from bme280 import BME280; BME280(i2c_dev=SMBus(1))\""
fi

sh createCron.sh

echo ""
echo "Setup complete."
echo "If I2C was just enabled for the first time, reboot now (sudo reboot) so the cron job can read the sensor on next boot."
