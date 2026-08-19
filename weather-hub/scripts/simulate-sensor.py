#!/usr/bin/env python3
"""Simulates a `sensor/main.py` device against weather-hub, without any Pi hardware.

Follows the same lifecycle the real sensor drives itself through:
register -> CALIBRATING -> READY -> (cron promotes to ACTIVE) -> stream fake readings.

Usage:
    python3 simulate-sensor.py --host home-hub --port 3001
    python3 simulate-sensor.py --host localhost --fast   # quick local loop, no sleeps
"""
import argparse
import json
import random
import socket
import time
import urllib.error
import urllib.request
import uuid


def request(method, url, payload=None):
    data = json.dumps(payload).encode() if payload is not None else b""
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method=method)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("192.168.1.0", 1))
        return s.getsockname()[0]
    finally:
        s.close()


def wobble(temperature, humidity, pressure):
    temperature = max(0.0, temperature + random.uniform(-0.3, 0.3))
    humidity = min(100.0, max(0.0, humidity + random.uniform(-1, 1)))
    pressure = pressure + random.uniform(-0.5, 0.5)
    return temperature, humidity, pressure


def register(base, device_uid, name, ip_address, retries):
    attempt = 1
    while True:
        try:
            return request("POST", f"{base}/devices/register", {
                "device_uid": device_uid,
                "device_name": name,
                "ip_address": ip_address,
            })
        except (urllib.error.URLError, urllib.error.HTTPError) as e:
            if attempt >= retries:
                raise
            sleep_time = attempt * attempt
            print(f"[sim] register failed (attempt {attempt}): {e}. Retrying in {sleep_time}s...")
            time.sleep(sleep_time)
            attempt += 1


def main():
    parser = argparse.ArgumentParser(description="Simulate a weather-hub sensor device")
    parser.add_argument("--host", default="home-hub", help="weather-hub host (default: home-hub)")
    parser.add_argument("--port", type=int, default=3001, help="weather-hub port (default: 3001)")
    parser.add_argument("--name", default=f"fake-sensor-{socket.gethostname()}", help="device name to register")
    parser.add_argument("--uid", default=None, help="fixed device UUID to reuse across runs (default: random each run)")
    parser.add_argument("--interval", type=float, default=5, help="seconds between readings once ACTIVE (default: 5)")
    parser.add_argument("--calibration-readings", type=int, default=5, help="simulated calibration readings (default: 5)")
    parser.add_argument("--calibration-delay", type=float, default=5, help="seconds between calibration readings (default: 5)")
    parser.add_argument("--fast", action="store_true", help="skip calibration/poll delays, for quick local testing")
    args = parser.parse_args()

    device_uid = args.uid or str(uuid.uuid4())
    base = f"http://{args.host}:{args.port}"
    calibration_delay = 0 if args.fast else args.calibration_delay
    poll_delay = 1 if args.fast else 5

    print(f"[sim] device_uid={device_uid} name={args.name} -> {base}")

    ip_address = local_ip()
    print("[sim] registering...")
    print(f"[sim] register response: {register(base, device_uid, args.name, ip_address, retries=5)}")

    print("[sim] marking CALIBRATING...")
    print(request("POST", f"{base}/devices/status/calibrating/{device_uid}"))

    temperature, humidity, pressure = 21.0, 45.0, 1013.0
    for i in range(args.calibration_readings):
        temperature, humidity, pressure = wobble(temperature, humidity, pressure)
        print(f"[sim] calibration reading {i + 1}/{args.calibration_readings}: "
              f"{temperature:.2f}C {humidity:.2f}% {pressure:.2f}hPa")
        if calibration_delay:
            time.sleep(calibration_delay)

    print("[sim] marking READY...")
    print(request("POST", f"{base}/devices/status/ready/{device_uid}"))

    print("[sim] waiting for the hub's cron job to promote READY -> ACTIVE...")
    while True:
        status = request("GET", f"{base}/devices/status/{device_uid}")["status"]
        print(f"[sim] status={status}")
        if status == "ACTIVE":
            break
        time.sleep(poll_delay)

    print("[sim] streaming readings, Ctrl+C to stop")
    try:
        while True:
            status = request("GET", f"{base}/devices/status/{device_uid}")["status"]
            if status != "ACTIVE":
                print(f"[sim] status={status}, not sending data")
                time.sleep(args.interval)
                continue
            temperature, humidity, pressure = wobble(temperature, humidity, pressure)
            payload = {
                "device_uid": device_uid,
                "temperature": f"{temperature:.2f}",
                "humidity": f"{humidity:.2f}",
                "pressure": f"{pressure:.2f}",
            }
            result = request("POST", f"{base}/measurement/record", payload)
            print(f"[sim] sent {payload} -> {result}")
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("\n[sim] stopped")


if __name__ == "__main__":
    main()
