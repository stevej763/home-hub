import { Modal, Card, Typography, FormControl, TextField, Button, Box } from '@mui/material';
import './LocationCreationModal.css';
import { createLocation } from '../../api/locations';
import {useState} from 'react';
const LocationCreationModal = ({ show, handleClose }) => {

    const [location, setLocation] = useState('')

    const handleSubmit = async (event) => {
        console.log('Submitting location: ', event.target.value);
        await createLocation(location)
        handleClose();
    };

    const handleUpdate = (event) => {
        setLocation(event.target.value);
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
                        Add Location
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Add a location
                    </Typography>
                    <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
                        <TextField id="outlined-basic" defaultValue={location} value={location} label="Location Name" variant="outlined" onChange={handleUpdate} />
                        <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
                    </FormControl>
            </Card>
        </Box>
        </Modal>
    )
};

export {LocationCreationModal};