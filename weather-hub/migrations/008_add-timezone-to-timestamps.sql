-- Up Migration

-- Existing values were written as naive UTC wall-clock digits (the app's only
-- consistent behavior across write paths); AT TIME ZONE 'UTC' reinterprets
-- them as such while converting the columns to store an actual instant.

ALTER TABLE device
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC',
    ALTER COLUMN last_active_at TYPE TIMESTAMP WITH TIME ZONE USING last_active_at AT TIME ZONE 'UTC';

ALTER TABLE location
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING updated_at AT TIME ZONE 'UTC';

ALTER TABLE temperature
    ALTER COLUMN reading_time TYPE TIMESTAMP WITH TIME ZONE USING reading_time AT TIME ZONE 'UTC';

ALTER TABLE humidity
    ALTER COLUMN reading_time TYPE TIMESTAMP WITH TIME ZONE USING reading_time AT TIME ZONE 'UTC';

ALTER TABLE pressure
    ALTER COLUMN reading_time TYPE TIMESTAMP WITH TIME ZONE USING reading_time AT TIME ZONE 'UTC';
