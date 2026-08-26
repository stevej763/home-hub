import { useEffect, useState } from 'react';
import { getPressureData } from '../api/measurements';

export interface PressureTrend {
    label: string;
    arrow: string;
    changeHpa: number;
}

const TREND_WINDOW_HOURS = 3;
const TREND_POLL_INTERVAL = 60000;

const classifyTrend = (changeHpa: number): Pick<PressureTrend, 'label' | 'arrow'> => {
    if (changeHpa >= 3) return { label: 'Rising quickly', arrow: '↑↑' };
    if (changeHpa >= 1) return { label: 'Rising', arrow: '↑' };
    if (changeHpa <= -3) return { label: 'Falling quickly', arrow: '↓↓' };
    if (changeHpa <= -1) return { label: 'Falling', arrow: '↓' };
    return { label: 'Steady', arrow: '→' };
};

// Barometric trend over the last few hours predicts weather far better than
// the raw hPa reading does, so this tracks the change across a rolling
// window rather than just the instantaneous value.
export const usePressureTrend = (deviceUid: string | undefined, enabled: boolean): PressureTrend | null => {
    const [trend, setTrend] = useState<PressureTrend | null>(null);

    useEffect(() => {
        if (!deviceUid || !enabled) {
            setTrend(null);
            return;
        }

        const fetchTrend = async () => {
            const to = new Date();
            const from = new Date(to.getTime() - TREND_WINDOW_HOURS * 60 * 60 * 1000);
            const data = await getPressureData(deviceUid, from.toISOString(), to.toISOString());
            // Bucketed rows come back newest-first; buckets with no readings are 0, not a real value.
            const readings = data
                .map((reading) => Number(reading.average_reading))
                .filter((value) => Number.isFinite(value) && value !== 0);

            if (readings.length < 2) {
                setTrend(null);
                return;
            }

            const changeHpa = readings[0] - readings[readings.length - 1];
            setTrend({ changeHpa, ...classifyTrend(changeHpa) });
        };

        fetchTrend();
        const intervalId = setInterval(fetchTrend, TREND_POLL_INTERVAL);
        return () => clearInterval(intervalId);
    }, [deviceUid, enabled]);

    return trend;
};
