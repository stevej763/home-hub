import { useParams, Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { getDevice } from '../../api/device';
import { DeviceDetailsModal } from '../../Components/Modal/DeviceDetailsModal';
import type { Device } from '../../api/types';

const DeviceInfoPage = () => {
    const { deviceUid } = useParams<{ deviceUid: string }>();
    const [device, setDevice] = useState<Partial<Device>>({});
    const [configOpen, setConfigOpen] = useState(false);

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
        fetchDevice();
    }, [fetchDevice]);

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

    const getWifiQuality = (dbm: number): string => {
        if (dbm >= -50) return 'Excellent';
        if (dbm >= -60) return 'Good';
        if (dbm >= -70) return 'Fair';
        return 'Poor';
    };

    return (
        <div>
            <nav className="font-mono text-xs uppercase tracking-widest text-face/50 mb-6">
                <Link to="/all-device-data" className="hover:text-brass transition-colors">
                    Control room
                </Link>
                <span className="mx-2">/</span>
                <Link to={`/all-device-data/${deviceUid}`} className="hover:text-brass transition-colors">
                    {device.device_name || deviceUid}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-face/80">Details</span>
            </nav>

            <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="font-display font-semibold uppercase tracking-wide text-face text-2xl leading-tight">
                    Station details
                </h1>
                <button
                    type="button"
                    onClick={() => setConfigOpen(true)}
                    className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-face/60 hover:text-face transition-colors"
                >
                    Configure
                </button>
            </div>

            <h2 className="font-display uppercase tracking-wide text-face/80 text-lg mb-4">Identity</h2>
            <div className="bg-face rounded-md shadow-face p-6 sm:p-8 mb-8">
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 font-mono text-xs text-ink-soft">
                    <div>
                        <dt className="uppercase tracking-widest">IP address</dt>
                        <dd className="text-ink mt-1">{device.ip_address || '—'}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">Device UID</dt>
                        <dd className="text-ink mt-1 truncate">{deviceUid}</dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">Last check-in</dt>
                        <dd className="text-ink mt-1">{lastActive}</dd>
                    </div>
                </dl>
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
                        <dd className="text-ink mt-1">
                            {device.wifi_signal_strength != null
                                ? `${getWifiQuality(device.wifi_signal_strength)} (${device.wifi_signal_strength} dBm)`
                                : '—'}
                        </dd>
                    </div>
                    <div>
                        <dt className="uppercase tracking-widest">Read errors</dt>
                        <dd className={`mt-1 ${readErrorCount > 0 ? 'text-rust' : 'text-ink'}`}>{readErrorCount}</dd>
                    </div>
                </dl>
            </div>

            <DeviceDetailsModal show={configOpen} handleClose={handleConfigClose} device={device} />
        </div>
    );
};

export default DeviceInfoPage;
