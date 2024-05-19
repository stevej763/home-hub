import { useEffect } from 'react';
import { useState } from 'react';
import './SummaryPage.css'
import DeviceOverview from '../../Components/DeviceOverview/DeviceOverview'
import { getDevices } from '../../api/device';
const SummaryPage = () => {

    const [devices, setDevices] = useState([]);
    
    useEffect(() => {
        const fetchDevices = async () => {
            const devices = await getDevices();
            setDevices(devices)
        }
          fetchDevices();
          const intervalId = setInterval(fetchDevices, 10000);
          return () => clearInterval(intervalId);
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