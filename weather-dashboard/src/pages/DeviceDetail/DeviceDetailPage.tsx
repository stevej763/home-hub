import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getDevice, getLatestReadingsForDeviceUid } from '../../api/device';
import StationDial from '../../Components/StationDial/StationDial';
import BarCharts from '../../Components/Chart/BarCharts';
import TimePicker from '../../Components/TimePicker/TimePicker';
import { usePressureTrend } from '../../hooks/usePressureTrend';
import type { Device, DeviceStatus, LatestReadings } from '../../api/types';

const STATUS_META: Record<DeviceStatus, { label: string; dot: string; pulse: boolean }> = {
    ACTIVE: { label: 'Live', dot: 'bg-teal', pulse: true },
    READY: { label: 'Ready', dot: 'bg-brass', pulse: false },
    CALIBRATING: { label: 'Calibrating', dot: 'bg-brass', pulse: true },
    REGISTERED: { label: 'Registered', dot: 'bg-slate', pulse: false },
    OFFLINE: { label: 'Offline', dot: 'bg-rust', pulse: false },
    DISABLED: { label: 'Disabled', dot: 'bg-slate', pulse: false },
    RETIRED: { label: 'Retired', dot: 'bg-slate', pulse: false },
};

const DeviceDetailPage = () => {
    const { deviceUid } = useParams<{ deviceUid: string }>();
    const [device, setDevice] = useState<Partial<Device>>({});
    const [latestReadings, setLatestReadings] = useState<LatestReadings>({});
    const [timePeriod, setTimePeriod] = useState(23);
    const updateInterval = 10000;

    const fetchDevice = useCallback(async () => {
        if (!deviceUid) return;
        const result = await getDevice(deviceUid);
        setDevice(result);
    }, [deviceUid]);

    useEffect(() => {
        if (!deviceUid) return;
        fetchDevice();
        const intervalId = setInterval(fetchDevice, updateInterval);
        return () => clearInterval(intervalId);
    }, [deviceUid, fetchDevice]);

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
    const status = device.status ? STATUS_META[device.status] : undefined;
    const pressureTrend = usePressureTrend(deviceUid, isActive);

    return (
        <div>
            <nav className="font-mono text-xs uppercase tracking-widest text-face/50 mb-6">
                <Link to="/all-device-data" className="hover:text-brass transition-colors">
                    Control room
                </Link>
                <span className="mx-2">/</span>
                <span className="text-face/80">{device.device_name || deviceUid}</span>
            </nav>

            <div className="bg-face rounded-md shadow-face p-6 sm:p-8 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="font-display font-semibold uppercase tracking-wide text-ink text-3xl sm:text-4xl leading-tight">
                                {device.device_name || 'Loading…'}
                            </h1>
                            <Link
                                to={`/all-device-data/${deviceUid}/details`}
                                className="shrink-0 mt-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft/70 hover:text-ink transition-colors"
                            >
                                Station details &rarr;
                            </Link>
                        </div>
                        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mt-1">
                            {device.location_name || 'Unassigned location'}
                        </p>
                        {status && (
                            <span className="flex items-center gap-1.5 mt-3">
                                <span
                                    className={`h-2 w-2 rounded-full ${status.dot} ${status.pulse ? 'animate-lamp' : ''}`}
                                />
                                <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                                    {status.label}
                                </span>
                            </span>
                        )}
                    </div>
                    <div className="self-center sm:self-start">
                        <StationDial
                            temperature={latestReadings.temperature}
                            humidity={latestReadings.humidity}
                            pressure={latestReadings.pressure}
                            pressureTrend={pressureTrend}
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
