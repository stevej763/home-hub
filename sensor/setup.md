# Setup pi

## update the system:
sudo apt update
sudo apt upgrade
## Install pip
sudo apt install python3-pip
## enable i2c interfaces
sudo raspi-config nonint do_i2c 0
## Install bme280 package globally (so cronjob can run it)
sudo pip install pimoroni-bme280 --break-system-packages
