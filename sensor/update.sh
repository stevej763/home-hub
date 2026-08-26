#!/bin/sh
# update.sh - pulls the latest sensor code and restarts it via reboot.
set -e

cd "$(dirname "$0")"

BEFORE=$(git rev-parse HEAD)
echo "Current version: $BEFORE"
echo "Pulling latest changes..."
git pull
AFTER=$(git rev-parse HEAD)
git rev-parse --short HEAD > version.txt

if [ "$BEFORE" = "$AFTER" ]; then
  echo "Already up to date."
  exit 0
fi

echo "Updated $BEFORE -> $AFTER"

if git diff --name-only "$BEFORE" "$AFTER" | grep -q "^sensor/requirements.txt$"; then
  echo "requirements.txt changed, reinstalling Python dependencies..."
  sudo pip install -r requirements.txt --break-system-packages
fi

echo "Rebooting to restart the sensor with the new code..."
sudo reboot
