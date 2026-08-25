# Setup pi

## Automated (recommended)
Download and run `setup.sh` directly on a fresh Pi - it clones the repo itself:
```
wget https://raw.githubusercontent.com/stevej763/weatherhub/main/sensor/setup.sh
sh setup.sh
```
This updates the system, installs dependencies, enables the i2c interface, clones the repo,
installs the Python deps (from `requirements.txt`), copies `.env.example` to `.env` (edit
`SENSOR_SERVER_IP`/`SENSOR_SERVER_PORT` afterwards if the hub isn't reachable at the defaults
`home-hub`/`3001`), and installs the `@reboot` cron job.

If i2c was just enabled for the first time, reboot afterwards (`sudo reboot`) so the cron job
can read the sensor on next boot. Check `sensor/logs/sensor_logs.log` and `sensor/logs/cronlog`
after reboot to confirm the device registered with the hub successfully.

## Updating
Once a Pi is set up, pull and deploy the latest sensor code with:
```
sh weatherhub/sensor/update.sh
```
This does a `git pull`, reinstalls `requirements.txt` only if it changed, then reboots the Pi so
the `@reboot` cron job restarts `main.py` on the new code. Run it per-Pi over SSH after pushing
changes to `main`.

## Manual steps (what setup.sh does, for reference)
```
sudo apt update
sudo apt upgrade
sudo apt install python3-pip vim git
sudo raspi-config nonint do_i2c 0
git clone https://github.com/stevej763/weatherhub.git
cd weatherhub/sensor
cp .env.example .env   # edit SENSOR_SERVER_IP/SENSOR_SERVER_PORT if needed
sudo pip install -r requirements.txt --break-system-packages
sh createCron.sh
```
