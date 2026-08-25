-- Up Migration

ALTER TABLE device
    ADD COLUMN cpu_temperature NUMERIC(5, 2),
    ADD COLUMN uptime_seconds BIGINT,
    ADD COLUMN read_error_count INTEGER,
    ADD COLUMN software_version TEXT,
    ADD COLUMN mac_address TEXT,
    ADD COLUMN wifi_signal_strength INTEGER;

COMMENT ON COLUMN public.device.cpu_temperature IS
'{
 "description" : "The Pi CPU temperature in degrees Celsius, as of the last reported reading"
}';

COMMENT ON COLUMN public.device.uptime_seconds IS
'{
 "description" : "How long the Pi had been running in seconds, as of the last reported reading"
}';

COMMENT ON COLUMN public.device.read_error_count IS
'{
 "description" : "Count of sensor read failures since the last successful reading report"
}';

COMMENT ON COLUMN public.device.software_version IS
'{
 "description" : "The git commit hash of the sensor code running on the device, captured at registration"
}';

COMMENT ON COLUMN public.device.mac_address IS
'{
 "description" : "The MAC address of the device, captured at registration"
}';

COMMENT ON COLUMN public.device.wifi_signal_strength IS
'{
 "description" : "The WiFi signal strength in dBm, as of the last reported reading, or NULL if not on WiFi"
}';
