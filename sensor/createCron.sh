sudo crontab -l > crontab_new 
echo "@reboot /usr/bin/sleep 45; sh /home/steve/home-hub/sensor/startup.sh > /home/steve/home-hub/sensor/logs/cronlog 2>&1" >> crontab_new
sudo crontab crontab_new
rm crontab_new
