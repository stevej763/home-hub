CREATE TABLE temperature (
	id BIGINT GENERATED ALWAYS AS IDENTITY,
	temperature_uid UUID NOT NULL,
    reading DECIMAL(10, 2) NOT NULL,
	reading_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    device_uid UUID NOT NULL,
	
	CONSTRAINT pk_temperature PRIMARY KEY (id),
	CONSTRAINT uk_temperature_uid UNIQUE(temperature_uid),
	CONSTRAINT fk_temperature_device FOREIGN KEY (device_uid) REFERENCES device(device_uid)
);

COMMENT ON TABLE public.temperature IS
'{
 "description" : "A table which contains all temperature readings from devices"
}';

COMMENT ON COLUMN public.temperature.id IS 
'{
 "description" : "The primary key for the temperature record"
}';


COMMENT ON COLUMN public.temperature.temperature_uid IS
'{
 "description" : "The uid for the temperature reading"
}';

COMMENT ON COLUMN public.temperature.reading_time IS
'{
 "description" : "The time the temperature reading was taken"
}';

COMMENT ON COLUMN public.temperature.device_uid IS
'{
 "description" : "The device uid for the temperature reading"
}';

COMMENT ON COLUMN public.temperature.reading IS
'{
 "description" : "The temperature reading at a given time"
}';
