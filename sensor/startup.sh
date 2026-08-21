#!/bin/sh
# startup.sh

cd /home/steve/home-hub/sensor

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

python3 main.py

