ALTER TABLE device ADD COLUMN last_active_at TIMESTAMP WITHOUT TIME ZONE;

COMMENT ON COLUMN public.device.lalast_active_at IS 
'{
 "description" : "The latest reading taken from the device"
}';
