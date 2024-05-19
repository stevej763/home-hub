import {useEffect, useState} from 'react';
import './DeviceOverview.css';
import { Card, CardContent, CardActions, CardActionArea, Button, CardHeader, Avatar, Chip, Typography, Modal } from '@mui/material';
import { getLatestReadingsForDeviceUid } from '../../api/device';
import CurrentReadingCharts from '../CurrentReadingCharts/CurrentReadingCharts';
import { Link } from 'react-router-dom';

const DeviceOverview = ({device}) => {

    const [latestReadings, setLatestReadings] = useState({});
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (!device) {
            return;
        } else {
            const fetchLatestDeviceReadings = async () => {
                const latestReadings = await getLatestReadingsForDeviceUid(device.device_uid);
                setLatestReadings(latestReadings)
            }
            fetchLatestDeviceReadings();
            const intervalId = setInterval(fetchLatestDeviceReadings, 10000);
            return () => clearInterval(intervalId);
        }
    }, [device]);

    const defaultAvatar = () => {
        return <Avatar src={process.env.PUBLIC_URL + '/Raspberry_Pi-Logo.wine.png'}/>
    }

    const statusChip = (status) => {
        const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        const color = status === 'ACTIVE' ? 'primary' : 'secondary';
        return <Chip label={formattedStatus} color={color}/>
    }

    const deviceInfo = (device, latestReadings) => {
        return (
            <>
                <Card elevation={4} sx={{ maxWidth: 600 }} className={`deviceCard`}>
                    <CardActionArea component={Link} to={`/device/${device.device_uid}`}>
                        <CardHeader 
                        avatar={defaultAvatar()} 
                        title={<Typography variant="h5">{device.device_name}</Typography>} 
                        action={statusChip(device.status)}
                        />
                        <CardContent>
                            <CurrentReadingCharts reading={latestReadings} width={100} height={100}/>
                        </CardContent>
                    </CardActionArea>
                    <CardActions>
                    <Button onClick={handleOpen}>Device details</Button>
                    </CardActions>
                </Card>
                <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                >
                    <Card>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            device Details
                        </Typography>
                        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                            Add ability to edit device details here
                        </Typography>
                    </Card>
                </Modal>
            </>
            
        )
    }
    return (
        <div>{deviceInfo(device, latestReadings)}</div>
    )
}

export default DeviceOverview;