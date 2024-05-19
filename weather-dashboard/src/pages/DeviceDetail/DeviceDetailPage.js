import { useParams } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import { useEffect, useState } from "react";
import { getDevice, getLatestReadingsForDeviceUid } from "../../api/device";
import CurrentReadingCharts from "../../Components/CurrentReadingCharts/CurrentReadingCharts";
import BarCharts from "../../Components/Chart/BarCharts";
import TimePicker from "../../Components/TimePicker/TimePicker";
import './DeviceDetail.css';
const DeviceDataPage = () => {
    const { deviceUid } = useParams();
    const [device, setDevice] = useState({});
    const [latestReadings, setLatestReadings] = useState({});
    const [timePeriod, setTimePeriod] = useState(1);
    const [updateInterval, setUpdateInterval] = useState(10000);

    useEffect(() => {
        if (!deviceUid) {
            console.error('No device UID provided');
            return;
        }
        const fetchDevices = async () => {
            console.log('fetching devices')
            const device = await getDevice(deviceUid);
            console.log('device:', device);
            setDevice(device)
        }
          fetchDevices();
    }, []);

    useEffect(() => {
        if (!deviceUid) {
            return;
        } else {
            const fetchLatestDeviceReadings = async () => {
                const latestReadings = await getLatestReadingsForDeviceUid(deviceUid);
                setLatestReadings(latestReadings)
            }
            fetchLatestDeviceReadings();
            const intervalId = setInterval(fetchLatestDeviceReadings, 10000);
            return () => clearInterval(intervalId);
        }
    }, []);

    const updateTimePeriod = (hours) => {
        setTimePeriod(hours);
    }

    const renderTimePicker = () => {
        return (
            <TimePicker
                timePeriod={timePeriod}
                updateTimePeriod={updateTimePeriod}
            />
        )
    }

    return (
        <div>
            <Breadcrumbs aria-label="breadcrumb">
            <Link
                underline="hover"
                sx={{ display: 'flex', alignItems: 'center' }}
                color="inherit"
                href="/"
            >
                <HomeIcon />Summary
            </Link>
                <Typography color="text.primary">{device.device_name}</Typography>
            </Breadcrumbs>
            <div className="dashboard-header">
                <h1>{device.device_name} Dashboard</h1>
                {renderTimePicker()}
            </div>
            <p>Device UID: {deviceUid}</p>
            <CurrentReadingCharts reading={latestReadings} width={300} height={200}/>
            <BarCharts deviceUid={deviceUid} timePeriod={timePeriod} updateInterval={updateInterval}/>
        </div>
    )
};



export default DeviceDataPage;