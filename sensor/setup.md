# Setup pi

## update the system:
sudo apt update
sudo apt upgrade
## Install pip
sudo apt install python3-pip
sudo apt install vim
sudo apt install git
## download code
`git clone https://github.com/stevej763/home-hub.git`
## enable i2c interfaces
sudo raspi-config nonint do_i2c 0
## Install bme280 package globally (so cronjob can run it)
sudo pip install pimoroni-bme280 --break-system-packages
## Add cronjob
`@reboot /usr/bin/sleep 60; sh /home/steve/dev/sensor/startup.sh >/home/steve/dev/sensor/logs/cronlog 2>&1`

