import { Modal, TextField, Button, Box } from '@mui/material';
import { useState } from 'react';
import { createLocation } from '../../api/locations';

const LocationCreationModal = ({ show, handleClose }) => {
    const [location, setLocation] = useState('');

    const handleSubmit = async () => {
        if (!location.trim()) return;
        await createLocation(location.trim());
        setLocation('');
        handleClose();
    };

    return (
        <Modal open={show} onClose={handleClose} aria-labelledby="add-location-title">
            <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-sm bg-face rounded-md shadow-face overflow-hidden outline-none">
                <div className="h-1 bg-brass" />
                <div className="p-6">
                    <h2 id="add-location-title" className="font-display uppercase tracking-wide text-ink text-lg">
                        Add location
                    </h2>
                    <p className="font-mono text-xs text-ink-soft/70 mt-1 mb-5">
                        Name a room or area to assign stations to.
                    </p>
                    <TextField
                        fullWidth
                        autoFocus
                        size="small"
                        placeholder="e.g. Greenhouse"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <div className="flex justify-end gap-2 mt-5">
                        <Button onClick={handleClose} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!location.trim()}>
                            Add location
                        </Button>
                    </div>
                </div>
            </Box>
        </Modal>
    );
};

export { LocationCreationModal };
