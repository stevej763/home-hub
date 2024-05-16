CREATE TABLE humidity (
	id BIGINT GENERATED ALWAYS AS IDENTITY,
	humidity_uid UUID NOT NULL,
    reading DECIMAL(10, 2) NOT NULL,
	reading_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    device_uid UUID NOT NULL,
	
	CONSTRAINT pk_humidity PRIMARY KEY (id),
	CONSTRAINT uk_humidity_uid UNIQUE(humidity_uid),
	CONSTRAINT fk_humidity_device FOREIGN KEY (device_uid) REFERENCES device(device_uid)
);

COMMENT ON TABLE public.humidity IS
'{
 "description" : "A table which contains all humidity readings from devices"
}';

COMMENT ON COLUMN public.humidity.id IS 
'{
 "description" : "The primary key for the humidity record"
}';


COMMENT ON COLUMN public.humidity.humidity_uid IS
'{
 "description" : "The uid for the humidity reading"
}';

COMMENT ON COLUMN public.humidity.reading_time IS
'{
 "description" : "The time the humidity reading was taken"
}';

COMMENT ON COLUMN public.humidity.device_uid IS
'{
 "description" : "The device uid for the humidity reading"
}';

COMMENT ON COLUMN public.humidity.reading IS
'{
 "description" : "The humidity reading at a given time"
}';
