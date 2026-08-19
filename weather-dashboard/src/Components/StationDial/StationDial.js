const RANGES = {
    temperature: { min: -10, max: 40, unit: '°', label: 'Temp', color: '#B8863A' },
    humidity: { min: 0, max: 100, unit: '%', label: 'Hum', color: '#2F6E68' },
    pressure: { min: 950, max: 1050, unit: 'hPa', label: 'Pres', color: '#5B6B72' },
};

const RADII = { temperature: 50, humidity: 38, pressure: 26 };
const STROKE = 7;
const CENTER = 60;

const clampFraction = (value, min, max) => {
    if (value === null || value === undefined || Number.isNaN(value)) return 0;
    return Math.min(1, Math.max(0, (value - min) / (max - min)));
};

const Ring = ({ metric, value, dim }) => {
    const { min, max, color } = RANGES[metric];
    const r = RADII[metric];
    const circumference = 2 * Math.PI * r;
    const fraction = clampFraction(value, min, max);
    return (
        <>
            <circle
                cx={CENTER}
                cy={CENTER}
                r={r}
                fill="none"
                stroke={dim ? '#3A4347' : '#E7DFC9'}
                strokeWidth={STROKE}
                opacity={0.5}
            />
            {!dim && (
                <circle
                    cx={CENTER}
                    cy={CENTER}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={STROKE}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - fraction)}
                    transform={`rotate(-90 ${CENTER} ${CENTER})`}
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                />
            )}
        </>
    );
};

/**
 * The station dial: a concentric-ring instrument readout for a device's
 * three measurements. Outer ring = temperature, middle = humidity,
 * inner = pressure - same ring order used everywhere this appears.
 */
const StationDial = ({
    temperature,
    humidity,
    pressure,
    size = 120,
    active = true,
    showLegend = true,
    className = '',
}) => {
    const temp = temperature !== undefined && temperature !== null ? parseFloat(temperature) : null;
    const hum = humidity !== undefined && humidity !== null ? parseFloat(humidity) : null;
    const pres = pressure !== undefined && pressure !== null ? parseFloat(pressure) : null;

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg viewBox="0 0 120 120" width={size} height={size}>
                    <Ring metric="temperature" value={temp} dim={!active} />
                    <Ring metric="humidity" value={hum} dim={!active} />
                    <Ring metric="pressure" value={pres} dim={!active} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {active && temp !== null ? (
                        <>
                            <span
                                className="font-mono font-medium text-ink leading-none tabular-nums"
                                style={{ fontSize: size * 0.19 }}
                            >
                                {temp.toFixed(1)}°
                            </span>
                            <span
                                className="font-mono uppercase tracking-widest text-ink-soft"
                                style={{ fontSize: Math.max(8, size * 0.07), marginTop: size * 0.03 }}
                            >
                                Celsius
                            </span>
                        </>
                    ) : (
                        <span
                            className="font-mono text-ink-soft/60"
                            style={{ fontSize: size * 0.16 }}
                        >
                            &mdash;
                        </span>
                    )}
                </div>
            </div>
            {showLegend && (
                <dl className="grid gap-1.5 font-mono text-xs">
                    {Object.entries(RANGES).map(([metric, meta]) => {
                        const value = { temperature: temp, humidity: hum, pressure: pres }[metric];
                        return (
                            <div key={metric} className="flex items-baseline gap-2">
                                <span
                                    className="h-2 w-2 rounded-full shrink-0"
                                    style={{ background: active ? meta.color : '#5B6B72' }}
                                />
                                <dt className="uppercase tracking-wide text-ink-soft w-9">{meta.label}</dt>
                                <dd className="tabular-nums text-ink">
                                    {active && value !== null ? `${value.toFixed(1)}${meta.unit}` : '—'}
                                </dd>
                            </div>
                        );
                    })}
                </dl>
            )}
        </div>
    );
};

export default StationDial;
