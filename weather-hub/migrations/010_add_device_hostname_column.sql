-- Up Migration

ALTER TABLE device ADD COLUMN hostname TEXT;

COMMENT ON COLUMN public.device.hostname IS
'{
 "description" : "The Pi OS hostname, refreshed on every registration. Distinct from device_name, which is a user-editable display name and is never overwritten by registration"
}';
