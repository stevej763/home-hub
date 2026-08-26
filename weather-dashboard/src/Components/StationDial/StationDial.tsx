import type { PressureTrend } from '../../hooks/usePressureTrend';

type Metric = 'temperature' | 'humidity' | 'pressure';

interface RangeMeta {
    min: number;
    max: number;
    unit: string;
    label: string;
    color: string;
    decimals: number;
}

const RANGES: Record<Metric, RangeMeta> = {
    temperature: { min: -10, max: 40, unit: '°C', label: 'Temp', color: '#B8863A', decimals: 1 },
    humidity: { min: 0, max: 100, unit: '%RH', label: 'Humid', color: '#2F6E68', decimals: 1 },
    pressure: { min: 950, max: 1050, unit: 'hPa', label: 'Baro', color: '#5B6B72', decimals: 0 },
};

// Geometry for a single gauge, in a fixed 0-100 viewBox scaled by `size`.
const CENTER = 50;
const RADIUS = 34;
const STROKE = 8;
const SWEEP = 250; // degrees of scale the arc covers
const START_ANGLE = 145; // clock-angle (0 = 3 o'clock, clockwise) where the scale begins, gap centred at the bottom

const polar = (angleDeg: number, radius: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
};

const clampFraction = (value: number | null, min: number, max: number): number => {
    if (value === null || value === undefined || Number.isNaN(value)) return 0;
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
};

interface GaugeProps {
    metric: Metric;
    value: number | null;
    size: number;
    active: boolean;
    trend?: PressureTrend | null;
}

const trendColorClass = (changeHpa: number): string => {
    if (changeHpa >= 1) return 'text-teal';
    if (changeHpa <= -1) return 'text-rust';
    return 'text-ink-soft';
};

/**
 * A single analog instrument gauge - an open arc (like a barometer's brass
 * face) rather than a full ring, so the reading sits in the open mouth
 * instead of being squeezed into a shared centre.
 */
const Gauge = ({ metric, value, size, active, trend }: GaugeProps) => {
    const meta = RANGES[metric];
    const fraction = clampFraction(value, meta.min, meta.max);
    const circumference = 2 * Math.PI * RADIUS;
    const scaleLength = (SWEEP / 360) * circumference;
    const valueLength = fraction * scaleLength;
    const hasReading = active && value !== null;

    const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
        const angle = START_ANGLE + t * SWEEP;
        const inner = polar(angle, RADIUS + STROKE / 2 + 3);
        const outer = polar(angle, RADIUS + STROKE / 2 + 7);
        return { key: t, x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
    });

    return (
        <div className="flex flex-col items-center">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" width={size} height={size}>
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS + STROKE / 2 + 9}
                        fill="none"
                        stroke="#201C14"
                        strokeWidth={0.75}
                        opacity={0.12}
                    />
                    {ticks.map((tick) => (
                        <line
                            key={tick.key}
                            x1={tick.x1}
                            y1={tick.y1}
                            x2={tick.x2}
                            y2={tick.y2}
                            stroke="#201C14"
                            strokeWidth={1}
                            opacity={0.18}
                            strokeLinecap="round"
                        />
                    ))}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke="#E7DFC9"
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                        strokeDasharray={`${scaleLength} ${circumference}`}
                        transform={`rotate(${START_ANGLE} ${CENTER} ${CENTER})`}
                    />
                    {hasReading && (
                        <circle
                            cx={CENTER}
                            cy={CENTER}
                            r={RADIUS}
                            fill="none"
                            stroke={meta.color}
                            strokeWidth={STROKE}
                            strokeLinecap="round"
                            strokeDasharray={`${valueLength} ${circumference - valueLength}`}
                            transform={`rotate(${START_ANGLE} ${CENTER} ${CENTER})`}
                            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                        />
                    )}
                </svg>
                <div
                    className="absolute inset-0 flex flex-col items-center justify-end"
                    style={{ paddingBottom: size * 0.09 }}
                >
                    <span
                        className="font-mono font-semibold text-ink leading-none tabular-nums"
                        style={{ fontSize: size * 0.195 }}
                    >
                        {hasReading ? value!.toFixed(meta.decimals) : '—'}
                    </span>
                    {hasReading && (
                        <span
                            className="font-mono uppercase tracking-wide text-ink-soft leading-none"
                            style={{ fontSize: Math.max(8, size * 0.085), marginTop: size * 0.02 }}
                        >
                            {meta.unit}
                        </span>
                    )}
                </div>
            </div>
            <span className="flex items-center gap-1 mt-1.5">
                <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ background: active ? meta.color : '#4A4536', opacity: active ? 1 : 0.5 }}
                />
                <span
                    className="font-mono uppercase tracking-widest text-ink-soft"
                    style={{ fontSize: Math.max(8, size * 0.1) }}
                >
                    {meta.label}
                </span>
            </span>
            {hasReading && trend && (
                <span
                    className={`font-mono tracking-wide ${trendColorClass(trend.changeHpa)}`}
                    style={{ fontSize: Math.max(8, size * 0.09) }}
                >
                    {trend.arrow} {trend.label} ({trend.changeHpa >= 0 ? '+' : ''}
                    {trend.changeHpa.toFixed(1)} hPa/3h)
                </span>
            )}
        </div>
    );
};

interface StationDialProps {
    temperature?: string | number | null;
    humidity?: string | number | null;
    pressure?: string | number | null;
    pressureTrend?: PressureTrend | null;
    size?: number;
    active?: boolean;
    className?: string;
}

/**
 * The station dial: a bank of three analog instrument gauges, one per
 * measurement, styled after a weather station's brass gauge panel.
 * Order is temperature, humidity, pressure - same order used everywhere
 * this appears.
 */
const StationDial = ({
    temperature,
    humidity,
    pressure,
    pressureTrend,
    size = 90,
    active = true,
    className = '',
}: StationDialProps) => {
    const temp = temperature !== undefined && temperature !== null ? parseFloat(String(temperature)) : null;
    const hum = humidity !== undefined && humidity !== null ? parseFloat(String(humidity)) : null;
    const pres = pressure !== undefined && pressure !== null ? parseFloat(String(pressure)) : null;

    return (
        <div className={`flex flex-wrap items-start justify-center gap-x-4 gap-y-3 ${className}`}>
            <Gauge metric="temperature" value={temp} size={size} active={active} />
            <Gauge metric="humidity" value={hum} size={size} active={active} />
            <Gauge metric="pressure" value={pres} size={size} active={active} trend={pressureTrend} />
        </div>
    );
};

export default StationDial;
