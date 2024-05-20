import { Modal, Card, Typography, FormControl, TextField, Button, Box } from '@mui/material';
import './LocationCreationModal.css';
import {useState} from 'react';
const DeviceDetailsModal = ({ show, handleClose, device }) => {

    const [deviceName, setDeviceName] = useState(device.device_name)

    const handleSubmit = async (event) => {
        console.log('Submitting device changes');
        handleClose();
    };

    const handleUpdate = (event) => {
    }

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
                    <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                        <TextField id="outlined-basic" value={deviceName} label="Device Name" variant="outlined" onChange={handleUpdate} />
                        <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
                    </FormControl>
            </Card>
        </Box>
        </Modal>
    )
};

export {DeviceDetailsModal};