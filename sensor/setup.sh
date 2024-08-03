#! bin/bash
# setup.sh

sudo apt update -y
sudo apt upgrade -y
sudo apt install python3-pip vim git -y
sudo raspi-config nonint do_i2c 0
git clone https://github.com/stevej763/home-hub.git
cd home-hub/
cd sensor/
mkdir logs
chmod 755 startup.sh
sudo pip install pimoroni-bme280 --break-system-packages
sudo crontab -l > crontab_new 
echo "@reboot /usr/bin/sleep 45; sh /home/steve/home-hub/sensor/startup.sh > /home/steve/home-hub/sensor/logs/cronlog 2>&1" >> crontab_new
sudo crontab crontab_new
rm crontab_new
