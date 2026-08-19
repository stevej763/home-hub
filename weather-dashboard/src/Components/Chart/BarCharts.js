import { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { getTemperatureData, getHumidityData, getPressureData } from '../../api/measurements';

const chartSx = {
    '& .MuiChartsAxis-tickLabel': { fill: '#4A4536', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11 },
    '& .MuiChartsAxis-line': { stroke: 'rgba(32,28,20,0.25)' },
    '& .MuiChartsAxis-tick': { stroke: 'rgba(32,28,20,0.25)' },
    '& .MuiChartsGrid-line': { stroke: 'rgba(32,28,20,0.08)' },
    '& .MuiBarElement-root': { rx: 2 },
};

const ChartPanel = ({ title, unit, color, data }) => {
    const timestamps = data.map((reading) => reading.timestamp);
    const values = data.map((reading) => reading.average_reading);
    const hasData = data.length > 0;

    return (
        <div className="bg-face rounded-md shadow-face p-4 sm:p-5">
            <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-display uppercase tracking-wide text-ink text-sm">{title}</h3>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60">{unit}</span>
            </div>
            {hasData ? (
                <BarChart
                    xAxis={[{ id: 'time', data: timestamps, scaleType: 'band', tickLabelStyle: { angle: 0 } }]}
                    series={[{ data: values, color }]}
                    height={220}
                    margin={{ left: 40, right: 10, top: 10, bottom: 30 }}
                    slotProps={{ legend: { hidden: true } }}
                    sx={chartSx}
                />
            ) : (
                <div className="h-[220px] flex items-center justify-center font-mono text-xs text-ink-soft/50 uppercase tracking-widest">
                    No readings in range
                </div>
            )}
        </div>
    );
};

const BarCharts = ({ deviceUid, timePeriod, updateInterval }) => {
    const getInterval = (hours) => {
        const to = new Date();
        const from = new Date();
        if (hours > 1) {
            from.setMinutes(0, 0, 0);
            to.setMinutes(0, 0, 0);
        }
        from.setHours(from.getHours() - hours);
        return { from: from.toISOString(), to: to.toISOString() };
    };

    const [temperatureData, setTemperatureData] = useState([]);
    const [humidityData, setHumidityData] = useState([]);
    const [pressureData, setPressureData] = useState([]);

    useEffect(() => {
        if (!deviceUid) return;
        const fetchTemperature = async () => {
            const timeInterval = getInterval(timePeriod);
            try {
                const data = await getTemperatureData(deviceUid, timeInterval.from, timeInterval.to);
                setTemperatureData(data.reverse());
            } catch (error) {
                console.error('Error fetching temperature data:', error);
            }
        };
        fetchTemperature();
        const intervalId = setInterval(fetchTemperature, updateInterval);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceUid, timePeriod, updateInterval]);

    useEffect(() => {
        if (!deviceUid) return;
        const fetchPressure = async () => {
            const timeInterval = getInterval(timePeriod);
            try {
                const data = await getPressureData(deviceUid, timeInterval.from, timeInterval.to);
                setPressureData(data.reverse());
            } catch (error) {
                console.error('Error fetching pressure data:', error);
            }
        };
        fetchPressure();
        const intervalId = setInterval(fetchPressure, updateInterval);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceUid, timePeriod, updateInterval]);

    useEffect(() => {
        if (!deviceUid) return;
        const fetchHumidity = async () => {
            const timeInterval = getInterval(timePeriod);
            try {
                const data = await getHumidityData(deviceUid, timeInterval.from, timeInterval.to);
                setHumidityData(data.reverse());
            } catch (error) {
                console.error('Error fetching humidity data:', error);
            }
        };
        fetchHumidity();
        const intervalId = setInterval(fetchHumidity, updateInterval);
        return () => clearInterval(intervalId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deviceUid, timePeriod, updateInterval]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ChartPanel title="Temperature" unit="°C" color="#B8863A" data={temperatureData} />
            <ChartPanel title="Humidity" unit="%" color="#2F6E68" data={humidityData} />
            <ChartPanel title="Pressure" unit="hPa" color="#5B6B72" data={pressureData} />
        </div>
    );
};

export default BarCharts;
