import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getDevice, getLatestReadingsForDeviceUid } from '../../api/device';
import StationDial from '../../Components/StationDial/StationDial';
import BarCharts from '../../Components/Chart/BarCharts';
import TimePicker from '../../Components/TimePicker/TimePicker';
import type { Device, LatestReadings } from '../../api/types';

const DeviceDetailPage = () => {
    const { deviceUid } = useParams<{ deviceUid: string }>();
    const [device, setDevice] = useState<Partial<Device>>({});
    const [latestReadings, setLatestReadings] = useState<LatestReadings>({});
    const [timePeriod, setTimePeriod] = useState(23);
    const updateInterval = 10000;

    useEffect(() => {
        if (!deviceUid) return;
        const fetchDevice = async () => {
            const result = await getDevice(deviceUid);
            setDevice(result);
        };
        fetchDevice();
        const intervalId = setInterval(fetchDevice, updateInterval);
        return () => clearInterval(intervalId);
    }, [deviceUid]);

    useEffect(() => {
        if (!deviceUid) return;
        const fetchLatestDeviceReadings = async () => {
            const readings = await getLatestReadingsForDeviceUid(deviceUid);
            setLatestReadings(readings);
        };
        fetchLatestDeviceReadings();
        const intervalId = setInterval(fetchLatestDeviceReadings, 5000);
        return () => clearInterval(intervalId);
    }, [deviceUid]);

    const isActive = device.status === 'ACTIVE';
    const lastActive = device.last_active_at ? new Date(device.last_active_at).toLocaleString() : '—';

    return (
        <div>
            <nav className="font-mono text-xs uppercase tracking-widest text-face/50 mb-6">
                <Link to="/" className="hover:text-brass transition-colors">
                    Stations
                </Link>
                <span className="mx-2">/</span>
                <span className="text-face/80">{device.device_name || deviceUid}</span>
            </nav>

            <div className="bg-face rounded-md shadow-face p-6 sm:p-8 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div>
                        <h1 className="font-display font-semibold uppercase tracking-wide text-ink text-3xl sm:text-4xl leading-tight">
                            {device.device_name || 'Loading…'}
                        </h1>
                        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mt-1">
                            {device.location_name || 'Unassigned location'}
                        </p>
                        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs text-ink-soft">
                            <dt className="uppercase tracking-widest">Status</dt>
                            <dd className="text-ink">{device.status || '—'}</dd>
                            <dt className="uppercase tracking-widest">IP</dt>
                            <dd className="text-ink">{device.ip_address || '—'}</dd>
                            <dt className="uppercase tracking-widest">UID</dt>
                            <dd className="text-ink truncate">{deviceUid}</dd>
                            <dt className="uppercase tracking-widest">Last check-in</dt>
                            <dd className="text-ink">{lastActive}</dd>
                        </dl>
                    </div>
                    <div className="self-center sm:self-start">
                        <StationDial
                            temperature={latestReadings.temperature}
                            humidity={latestReadings.humidity}
                            pressure={latestReadings.pressure}
                            size={132}
                            active={isActive}
                        />
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="font-display uppercase tracking-wide text-face/80 text-lg">History</h2>
                <TimePicker timePeriod={timePeriod} updateTimePeriod={setTimePeriod} />
            </div>
            <BarCharts deviceUid={deviceUid} timePeriod={timePeriod} updateInterval={updateInterval} />
        </div>
    );
};

export default DeviceDetailPage;
