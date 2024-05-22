import { Modal, Card, Typography, FormControl, TextField, Button, Box, Select } from '@mui/material';
import './LocationCreationModal.css';
import {useEffect, useState} from 'react';
import { getLocations } from '../../api/locations';
import { MenuItem } from '@mui/material';
import { postDeviceChanges } from '../../api/device';
import {InputLabel} from '@mui/material';

const DeviceDetailsModal = ({ show, handleClose, device }) => {

    const [deviceName, setDeviceName] = useState(device.device_name)
    const [location, setLocation] = useState(device.location_uid)
    const [locations, setLocations] = useState([])

    useEffect(() => {
        if (!show) {
            return;
        }
        const fetchLocations = async () => {
            const locations = await getLocations();
            setLocations(locations);
        }
        fetchLocations();
    }, [show]);

    const handleSubmit = async () => {
        const payload = {
            'deviceUid': device.device_uid,
            'deviceName': deviceName,
            'locationUid': location
        }
        await postDeviceChanges(payload);
        handleClose();
    };

    return (
        <Modal
            open={show}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >   
        <Box className={'modalBase'}>
            <Card>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Device Device
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Update device details
                    </Typography>
                    <FormControl variant="filled" sx={{ m: 1, minWidth: 100 }}>
                        <TextField id="outlined-basic" value={deviceName} onChange={(e) => setDeviceName(e.target.value)}/>
                        <Select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}>
                            {locations.map((location) => {
                                return <MenuItem key={location.location_uid} value={location.location_uid}>{location.location_name}</MenuItem>
                            })}
                        </Select>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
                    </FormControl>
            </Card>
        </Box>
        </Modal>
    )
};

export {DeviceDetailsModal};