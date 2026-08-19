import { useEffect, useState } from 'react';
import DeviceOverview from '../../Components/DeviceOverview/DeviceOverview';
import { getDevices } from '../../api/device';
import type { Device } from '../../api/types';

const SummaryPage = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loaded, setLoaded] = useState(false);

    const fetchDevices = async () => {
        const result = await getDevices();
        const sortedDevices = [...result].sort((a, b) => a.device_name.localeCompare(b.device_name));
        setDevices(sortedDevices);
        setLoaded(true);
    };

    useEffect(() => {
        fetchDevices();
        const intervalId = setInterval(fetchDevices, 10000);
        return () => clearInterval(intervalId);
    }, []);

    if (loaded && devices.length === 0) {
        return (
            <div className="text-center py-24">
                <p className="font-display uppercase tracking-widest text-face/60 text-lg">
                    No stations registered yet
                </p>
                <p className="font-mono text-sm text-face/40 mt-2">
                    Power on a sensor and it will check in here automatically.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {devices.map((device, i) => (
                <div key={device.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-rise">
                    <DeviceOverview device={device} updateDevices={fetchDevices} />
                </div>
            ))}
        </div>
    );
};

export default SummaryPage;
