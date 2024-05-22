import { useEffect } from 'react';
import { useState } from 'react';
import './SummaryPage.css'
import DeviceOverview from '../../Components/DeviceOverview/DeviceOverview'
import { getDevices } from '../../api/device';
const SummaryPage = () => {

    const [devices, setDevices] = useState([]);
    
    const fetchDevices = async () => {
        const devices = await getDevices();
        const sortedDevices = devices.sort((a, b) => a.device_name.localeCompare(b.device_name));
        setDevices(sortedDevices)
    }

    useEffect(() => {
        fetchDevices();
        const intervalId = setInterval(fetchDevices, 10000);
        return () => clearInterval(intervalId);
    }, []);

    const deviceGrid = (devices) => {
        return devices.sort().map((device) => <DeviceOverview key={device.id} device={device} updateDevices={fetchDevices}/>)
    }

    return (
        <div className='DeviceGrid'>
            {deviceGrid(devices)}
        </div>
    )
}

export default SummaryPage;