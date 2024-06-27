# PGPASSWORD=password psql -h 192.168.1.66 -U postgres -a -f 000_createdb.sql
PGPASSWORD=password psql -h 192.168.1.66 -U postgres -d weatherhub -a -f 001_device.sql
PGPASSWORD=password psql -h 192.168.1.66 -U postgres -d weatherhub -a -f 002_temperature.sql
PGPASSWORD=password psql -h 192.168.1.66 -U postgres -d weatherhub -a -f 003_humidity.sql
PGPASSWORD=password psql -h 192.168.1.66 -U postgres -d weatherhub -a -f 004_pressure.sql
PGPASSWORD=password psql -h 192.168.1.66 -U postgres -d weatherhub -a -f 005_add_device_last_active_at_column.sql
PGPASSWORD=password psql -h 192.168.1.66 -U postgres -d weatherhub -a -f 006_location.sql
PGPASSWORD=password psql -h 192.168.1.66 -U postgres -d weatherhub -a -f 007_add_deveice_location_fk.sql