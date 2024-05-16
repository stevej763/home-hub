import { useEffect } from 'react';
import { useState } from 'react';
import './SummaryPage.css'
import DeviceOverview from '../../Components/DeviceOverview/DeviceOverview'
import { getDevices } from '../../api/device';
const SummaryPage = () => {

    const [devices, setDevices] = useState([]);
    
    useEffect(() => {
        const fetchDevices = async () => {
            console.log('fetching devices')
            const devices = await getDevices();
            setDevices(devices)
        }
          fetchDevices();
    }, []);

    const deviceGrid = (devices) => {
        return devices.map((device) => <DeviceOverview key={device.id} device={device}/>)
        
    }

    return (
        <div className='DeviceGrid'>
            {deviceGrid(devices)}
        </div>
    )
}

export default SummaryPage;