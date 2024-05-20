CREATE TABLE location (
	id BIGINT GENERATED ALWAYS AS IDENTITY,
    location_uid UUID NOT NULL,
    location_name TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    
    CONSTRAINT pk_location PRIMARY KEY (id),
	CONSTRAINT uk_location_name UNIQUE(location_name),
	CONSTRAINT uk_location_uid UNIQUE(location_uid)
);

COMMENT ON TABLE public.location IS
'{
 "description" : "A table of location names"
}';

COMMENT ON COLUMN public.location.id IS
'{
 "description" : "The primary key for the location record"
}';

COMMENT ON COLUMN public.location.location_uid IS
'{
 "description" : "The uid for the location"
}';

COMMENT ON COLUMN public.location.location_name IS
'{
 "description" : "The name of the location"
}';

COMMENT ON COLUMN public.location.created_at IS
'{
 "description" : "The time the location was created"
}';

COMMENT ON COLUMN public.location.updated_at IS
'{
 "description" : "The time the location was last updated"
}';