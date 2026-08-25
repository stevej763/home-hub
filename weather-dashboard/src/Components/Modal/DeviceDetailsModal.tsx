import { Modal, TextField, Button, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useEffect, useState } from 'react';
import { getLocations } from '../../api/locations';
import { postDeviceChanges } from '../../api/device';
import type { Device, Location } from '../../api/types';

interface DeviceDetailsModalProps {
    show: boolean;
    handleClose: () => void;
    device: Partial<Device>;
}

const DeviceDetailsModal = ({ show, handleClose, device }: DeviceDetailsModalProps) => {
    const [deviceName, setDeviceName] = useState(device.device_name || '');
    const [location, setLocation] = useState(device.location_uid || '');
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        if (!show) return;
        setDeviceName(device.device_name || '');
        setLocation(device.location_uid || '');
        const fetchLocations = async () => {
            const result = await getLocations();
            setLocations(result);
        };
        fetchLocations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            deviceUid: device.device_uid || '',
            deviceName: deviceName,
            locationUid: location,
        };
        await postDeviceChanges(payload);
        handleClose();
    };

    return (
        <Modal open={show} onClose={handleClose} aria-labelledby="device-details-title">
            <Box
                component="form"
                onSubmit={handleSubmit}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-face rounded-md shadow-face overflow-hidden outline-none"
            >
                <div className="h-1 bg-brass" />
                <div className="p-6">
                    <h2 id="device-details-title" className="font-display uppercase tracking-wide text-ink text-lg">
                        Configure station
                    </h2>
                    <p className="font-mono text-xs text-ink-soft/70 mt-1 mb-5">
                        Rename this station or reassign its location.
                    </p>
                    <div className="flex flex-col gap-4">
                        <TextField
                            fullWidth
                            size="small"
                            label="Station name"
                            value={deviceName}
                            onChange={(e) => setDeviceName(e.target.value)}
                        />
                        <p className="font-mono text-xs text-ink-soft/70 -mt-2">
                            Hostname: {device.hostname || '—'}
                        </p>
                        <FormControl fullWidth size="small">
                            <InputLabel id="device-location-label">Location</InputLabel>
                            <Select
                                labelId="device-location-label"
                                label="Location"
                                value={location}
                                onChange={(e: SelectChangeEvent) => setLocation(e.target.value)}
                            >
                                {locations.map((loc) => (
                                    <MenuItem key={loc.location_uid} value={loc.location_uid}>
                                        {loc.location_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Button onClick={handleClose} color="inherit">
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary">
                            Save changes
                        </Button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export { DeviceDetailsModal };
