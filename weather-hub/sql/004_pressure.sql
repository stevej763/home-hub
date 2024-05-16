CREATE TABLE pressure (
	id BIGINT GENERATED ALWAYS AS IDENTITY,
	pressure_uid UUID NOT NULL,
    reading DECIMAL(10, 2) NOT NULL,
	reading_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    device_uid UUID NOT NULL,
	
	CONSTRAINT pk_pressure PRIMARY KEY (id),
	CONSTRAINT uk_pressure_uid UNIQUE(pressure_uid),
	CONSTRAINT fk_pressure_device FOREIGN KEY (device_uid) REFERENCES device(device_uid)
);

COMMENT ON TABLE public.pressure IS
'{
 "description" : "A table which contains all pressure readings from devices"
}';

COMMENT ON COLUMN public.pressure.id IS 
'{
 "description" : "The primary key for the pressure record"
}';

COMMENT ON COLUMN public.pressure.pressure_uid IS
'{
 "description" : "The uid for the pressure reading"
}';

COMMENT ON COLUMN public.pressure.reading_time IS
'{
 "description" : "The time the pressure reading was taken"
}';

COMMENT ON COLUMN public.pressure.device_uid IS
'{
 "description" : "The device uid for the pressure reading"
}';

COMMENT ON COLUMN public.pressure.reading IS
'{
 "description" : "The pressure reading at a given time"
}';
