CREATE TABLE device (
	id BIGINT GENERATED ALWAYS AS IDENTITY,
	device_uid UUID NOT NULL,
	device_name TEXT NOT NULL,
	ip_address TEXT NOT NULL,
	created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
	status TEXT NOT NULL,
	
	CONSTRAINT pk_device PRIMARY KEY (id),
	CONSTRAINT uk_device_name UNIQUE(device_name),
	CONSTRAINT uk_device_uid UNIQUE(device_uid)
);

COMMENT ON TABLE public.device IS
'{
 "description" : "A table which contains a record for devices that have connected to the weather hub"
}';

COMMENT ON COLUMN public.device.id IS 
'{
 "description" : "The primary key for the device record"
}';

COMMENT ON COLUMN public.device.device_uid IS 
'{
 "description" : "The uid for the device"
}';

COMMENT ON COLUMN public.device.device_name IS 
'{
 "description" : "The human readable name of the device"
}';

COMMENT ON COLUMN public.device.ip_address IS 
'{
 "description" : "The current ip address of the connected device"
}';

COMMENT ON COLUMN public.device.created_at IS 
'{
 "description" : "When the device was created"
}';

COMMENT ON COLUMN public.device.updated_at IS 
'{
 "description" : "When the device record was last updated"
}';

COMMENT ON COLUMN public.device.status IS 
'{
 "description" : "The current status of the device"
}';

