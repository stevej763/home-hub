#!/bin/sh
# createCron.sh

CRON_LINE="@reboot /usr/bin/sleep 45; sh /home/steve/weatherhub/sensor/startup.sh > /home/steve/weatherhub/sensor/logs/cronlog 2>&1"

(sudo crontab -l 2>/dev/null | grep -vF "startup.sh"; echo "$CRON_LINE") | sudo crontab -
