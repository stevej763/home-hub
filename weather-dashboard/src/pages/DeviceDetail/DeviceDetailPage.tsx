import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getDevice, getLatestReadingsForDeviceUid } from '../../api/device';
import StationDial from '../../Components/StationDial/StationDial';
import BarCharts from '../../Components/Chart/BarCharts';
import TimePicker from '../../Components/TimePicker/TimePicker';
import { DeviceDetailsModal } from '../../Components/Modal/DeviceDetailsModal';
import type { Device, LatestReadings } from '../../api/types';

const DeviceDetailPage = () => {
    const { deviceUid } = useParams<{ deviceUid: string }>();
    const [device, setDevice] = useState<Partial<Device>>({});
    const [latestReadings, setLatestReadings] = useState<LatestReadings>({});
    const [timePeriod, setTimePeriod] = useState(23);
    const [configOpen, setConfigOpen] = useState(false);
    const updateInterval = 10000;

    const fetchDevice = useCallback(async () => {
        if (!deviceUid) return;
        const result = await getDevice(deviceUid);
        setDevice(result);
    }, [deviceUid]);

    const handleConfigClose = () => {
        fetchDevice();
        setConfigOpen(false);
    };

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
    const lastActive = device.last_active_at ? new Date(device.last_active_at).toLocaleString() : '—';

    const formatUptime = (seconds: string | null | undefined): string => {
        if (seconds == null) return '—';
        const total = Number(seconds);
        if (!Number.isFinite(total)) return '—';
        const days = Math.floor(total / 86400);
        const hours = Math.floor((total % 86400) / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const parts: string[] = [];
        if (days) parts.push(`${days}d`);
        if (days || hours) parts.push(`${hours}h`);
        parts.push(`${minutes}m`);
        return parts.join(' ');
    };

    const readErrorCount = device.read_error_count ?? 0;

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
                        <div className="flex items-start justify-between gap-4">
                            <h1 className="font-display font-semibold uppercase tracking-wide text-ink text-3xl sm:text-4xl leading-tight">
                                {device.device_name || 'Loading…'}
                            </h1>
                            <button
                                type="button"
                                onClick={() => setConfigOpen(true)}
                                className="shrink-0 mt-2 font-mono text-[11px] uppercase tracking-widest text-ink-soft/70 hover:text-ink transition-colors"
                            >
                                Configure
                            </button>
                        </div>
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

            <h2 className="font-display uppercase tracking-wide text-face/80 text-lg mb-4">Diagnostics</h2>
            <div className="bg-face rounded-md shadow-face p-6 sm:p-8 mb-8">
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 font-mono text-xs text-ink-soft">
                    <div>
                        <dt className="uppercase tracking-widest">Hostname</dt>
                        <dd className="text-ink mt-1">{device.hostname || '—'}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">Software version</dt>
                        <dd className="text-ink mt-1">{device.software_version || '—'}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">MAC address</dt>
                        <dd className="text-ink mt-1">{device.mac_address || '—'}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">CPU temperature</dt>
                        <dd className="text-ink mt-1">{device.cpu_temperature != null ? `${device.cpu_temperature}°C` : '—'}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">Uptime</dt>
                        <dd className="text-ink mt-1">{formatUptime(device.uptime_seconds)}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">WiFi signal</dt>
                        <dd className="text-ink mt-1">{device.wifi_signal_strength != null ? `${device.wifi_signal_strength} dBm` : '—'}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">Read errors</dt>
                        <dd className={`mt-1 ${readErrorCount > 0 ? 'text-rust' : 'text-ink'}`}>{readErrorCount}</dd>
                    </div>
                </dl>
            </div>

            <div className="flex items-center justify-between mb-4">
                <h2 className="font-display uppercase tracking-wide text-face/80 text-lg">History</h2>
                <TimePicker timePeriod={timePeriod} updateTimePeriod={setTimePeriod} />
            </div>
            <BarCharts deviceUid={deviceUid} timePeriod={timePeriod} updateInterval={updateInterval} />

            <DeviceDetailsModal show={configOpen} handleClose={handleConfigClose} device={device} />
        </div>
    );
};

export default DeviceDetailPage;
