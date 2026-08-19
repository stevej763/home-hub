import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDevices, deleteDevice, activateDevice, clearDeviceData } from '../../api/device';

const STATUS_META = {
    ACTIVE: { label: 'Live', dot: 'bg-teal' },
    READY: { label: 'Ready', dot: 'bg-brass' },
    CALIBRATING: { label: 'Calibrating', dot: 'bg-brass' },
    REGISTERED: { label: 'Registered', dot: 'bg-slate' },
    OFFLINE: { label: 'Offline', dot: 'bg-rust' },
    DISABLED: { label: 'Disabled', dot: 'bg-slate' },
    RETIRED: { label: 'Retired', dot: 'bg-slate' },
};

const ActionButton = ({ onClick, children, tone = 'default' }) => {
    const toneClasses = {
        default: 'text-ink-soft hover:text-ink hover:bg-ink/5',
        danger: 'text-rust hover:text-rust hover:bg-rust/10',
    };
    return (
        <button
            type="button"
            onClick={onClick}
            className={`font-mono text-[11px] uppercase tracking-widest px-2.5 py-1 rounded-sm transition-colors ${toneClasses[tone]}`}
        >
            {children}
        </button>
    );
};

const AllDeviceDataPage = () => {
    const [devices, setDevices] = useState([]);

    const fetchDevices = async () => {
        const result = await getDevices();
        setDevices(result);
    };

    useEffect(() => {
        fetchDevices();
        const intervalId = setInterval(fetchDevices, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const handleDelete = async (deviceUid, deviceName) => {
        if (!window.confirm(`Delete ${deviceName}? This removes the station and cannot be undone.`)) return;
        const ok = await deleteDevice(deviceUid);
        if (ok) setDevices((prev) => prev.filter((d) => d.device_uid !== deviceUid));
    };

    const handleActivate = async (deviceUid) => {
        const ok = await activateDevice(deviceUid);
        if (ok) {
            setDevices((prev) =>
                prev.map((d) => (d.device_uid === deviceUid ? { ...d, status: 'ACTIVE' } : d))
            );
        }
    };

    const handleClearData = async (deviceUid, deviceName) => {
        if (!window.confirm(`Clear all recorded readings for ${deviceName}?`)) return;
        await clearDeviceData(deviceUid);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-display font-semibold uppercase tracking-wide text-face text-2xl">
                    Control room
                </h1>
                <p className="font-mono text-xs text-face/50 mt-1">
                    Manage stations directly - activate, clear readings, or remove them.
                </p>
            </div>

            {devices.length === 0 ? (
                <div className="bg-face rounded-md shadow-face p-10 text-center">
                    <p className="font-mono text-sm text-ink-soft uppercase tracking-widest">No stations</p>
                </div>
            ) : (
                <div className="bg-face rounded-md shadow-face overflow-hidden">
                    <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_auto] gap-4 px-5 py-2.5 border-b border-ink/10 font-mono text-[10px] uppercase tracking-widest text-ink-soft/60">
                        <span>Status</span>
                        <span>Station</span>
                        <span className="hidden sm:block">IP address</span>
                        <span className="hidden sm:block">UID</span>
                        <span className="text-right">Actions</span>
                    </div>
                    <ul className="divide-y divide-ink/10">
                        {devices.map((device) => {
                            const status = STATUS_META[device.status] || STATUS_META.REGISTERED;
                            return (
                                <li
                                    key={device.device_uid}
                                    className="grid grid-cols-[auto_1.5fr_1fr_1fr_auto] gap-4 items-center px-5 py-3"
                                >
                                    <span className="flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft hidden md:inline">
                                            {status.label}
                                        </span>
                                    </span>
                                    <Link
                                        to={`/device/${device.device_uid}`}
                                        className="font-body text-ink hover:text-brass-dark transition-colors truncate"
                                    >
                                        {device.device_name}
                                    </Link>
                                    <span className="font-mono text-xs text-ink-soft hidden sm:block truncate">
                                        {device.ip_address}
                                    </span>
                                    <span className="font-mono text-xs text-ink-soft/70 hidden sm:block truncate">
                                        {device.device_uid}
                                    </span>
                                    <span className="flex items-center justify-end gap-1 flex-wrap">
                                        {device.status !== 'ACTIVE' && (
                                            <ActionButton onClick={() => handleActivate(device.device_uid)}>
                                                Activate
                                            </ActionButton>
                                        )}
                                        <ActionButton onClick={() => handleClearData(device.device_uid, device.device_name)}>
                                            Clear data
                                        </ActionButton>
                                        <ActionButton
                                            tone="danger"
                                            onClick={() => handleDelete(device.device_uid, device.device_name)}
                                        >
                                            Delete
                                        </ActionButton>
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AllDeviceDataPage;
