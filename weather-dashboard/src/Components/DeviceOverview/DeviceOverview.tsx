import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLatestReadingsForDeviceUid } from '../../api/device';
import StationDial from '../StationDial/StationDial';
import { DeviceDetailsModal } from '../Modal/DeviceDetailsModal';
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

const Rivet = ({ className }: { className: string }) => (
    <span className={`absolute h-1.5 w-1.5 rounded-full bg-ink/15 shadow-rivet ${className}`} />
);

interface DeviceOverviewProps {
    device: Device;
    updateDevices: () => void;
}

const DeviceOverview = ({ device, updateDevices }: DeviceOverviewProps) => {
    const [latestReadings, setLatestReadings] = useState<LatestReadings>({});
    const [open, setOpen] = useState(false);
    const handleOpen = (e: React.MouseEvent) => {
        e.preventDefault();
        setOpen(true);
    };
    const handleClose = () => {
        updateDevices();
        setOpen(false);
    };

    useEffect(() => {
        if (!device) return;
        const fetchLatestDeviceReadings = async () => {
            const readings = await getLatestReadingsForDeviceUid(device.device_uid);
            setLatestReadings(readings);
        };
        fetchLatestDeviceReadings();
        const intervalId = setInterval(fetchLatestDeviceReadings, 5000);
        return () => clearInterval(intervalId);
    }, [device]);

    const status = STATUS_META[device.status] || STATUS_META.REGISTERED;
    const isActive = device.status === 'ACTIVE';

    return (
        <>
            <Link
                to={`/device/${device.device_uid}`}
                className="group relative block bg-face rounded-md shadow-face p-5 transition-transform duration-300 hover:-translate-y-1"
            >
                <Rivet className="top-2 left-2" />
                <Rivet className="top-2 right-2" />
                <Rivet className="bottom-2 left-2" />
                <Rivet className="bottom-2 right-2" />

                <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="min-w-0">
                        <h2 className="font-display font-semibold uppercase tracking-wide text-ink text-xl leading-tight truncate">
                            {device.device_name}
                        </h2>
                        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft/70 mt-0.5">
                            {device.location_name || 'Unassigned'}
                        </p>
                    </div>
                    <span className="flex items-center gap-1.5 shrink-0 pt-1">
                        <span
                            className={`h-2 w-2 rounded-full ${status.dot} ${status.pulse ? 'animate-lamp' : ''}`}
                        />
                        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft">
                            {status.label}
                        </span>
                    </span>
                </div>

                <div className="mt-4 flex justify-center">
                    <StationDial
                        temperature={latestReadings.temperature}
                        humidity={latestReadings.humidity}
                        pressure={latestReadings.pressure}
                        size={90}
                        active={isActive}
                    />
                </div>

                <div className="mt-5 pt-3 border-t border-ink/10 flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-widest text-brass-dark group-hover:text-brass transition-colors">
                        View station &rarr;
                    </span>
                    <button
                        type="button"
                        onClick={handleOpen}
                        className="font-mono text-[11px] uppercase tracking-widest text-ink-soft/70 hover:text-ink transition-colors"
                    >
                        Configure
                    </button>
                </div>
            </Link>
            <DeviceDetailsModal show={open} handleClose={handleClose} device={device} />
        </>
    );
};

export default DeviceOverview;
