import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLatestReadingsForDeviceUid } from '../../api/device';
import StationDial from '../StationDial/StationDial';
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

const Rivet = ({ className }: { className: string }) => (
    <span className={`absolute h-1.5 w-1.5 rounded-full bg-ink/15 shadow-rivet ${className}`} />
);

interface DeviceOverviewProps {
    device: Device;
}

const DeviceOverview = ({ device }: DeviceOverviewProps) => {
    const [latestReadings, setLatestReadings] = useState<LatestReadings>({});

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
    const pressureTrend = usePressureTrend(device.device_uid, isActive);

    return (
        <Link
            to={`/all-device-data/${device.device_uid}`}
            className="group relative block bg-face rounded-md shadow-face p-8 transition-transform duration-300 hover:-translate-y-1"
        >
            <Rivet className="top-3 left-3" />
            <Rivet className="top-3 right-3" />
            <Rivet className="bottom-3 left-3" />
            <Rivet className="bottom-3 right-3" />

            <div className="flex items-start justify-between gap-3 mb-1">
                <div className="min-w-0">
                    <h2 className="font-display font-semibold uppercase tracking-wide text-ink text-3xl leading-tight truncate">
                        {device.device_name}
                    </h2>
                    <p className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mt-1">
                        {device.location_name || 'Unassigned'}
                    </p>
                </div>
                <span className="flex items-center gap-1.5 shrink-0 pt-1.5">
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${status.dot} ${status.pulse ? 'animate-lamp' : ''}`}
                    />
                    <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                        {status.label}
                    </span>
                </span>
            </div>

            <div className="mt-7 flex justify-center">
                <StationDial
                    temperature={latestReadings.temperature}
                    humidity={latestReadings.humidity}
                    pressure={latestReadings.pressure}
                    pressureTrend={pressureTrend}
                    size={132}
                    active={isActive}
                />
            </div>

            <div className="mt-7 pt-5 border-t border-ink/10">
                <span className="font-mono text-xs uppercase tracking-widest text-brass-dark group-hover:text-brass transition-colors">
                    View station &rarr;
                </span>
            </div>
        </Link>
    );
};

export default DeviceOverview;
