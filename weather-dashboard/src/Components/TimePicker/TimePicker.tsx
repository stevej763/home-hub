interface Period {
    value: number;
    label: string;
}

const PERIODS: Period[] = [
    { value: 1, label: '1h' },
    { value: 3, label: '4h' },
    { value: 7, label: '8h' },
    { value: 11, label: '12h' },
    { value: 23, label: '1d' },
    { value: 167, label: '1w' },
    { value: 719, label: '1m' },
    { value: 8759, label: '1y' },
];

interface TimePickerProps {
    timePeriod: number;
    updateTimePeriod: (value: number) => void;
}

const TimePicker = ({ timePeriod, updateTimePeriod }: TimePickerProps) => {
    return (
        <div
            role="radiogroup"
            aria-label="Time period"
            className="inline-flex items-center bg-panel-raised rounded-sm p-1 gap-0.5 overflow-x-auto max-w-full"
        >
            {PERIODS.map((period) => {
                const selected = period.value === timePeriod;
                return (
                    <button
                        key={period.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => updateTimePeriod(period.value)}
                        className={`font-mono text-xs uppercase tracking-wide px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors ${
                            selected
                                ? 'bg-brass text-panel font-medium'
                                : 'text-face/60 hover:text-face hover:bg-panel-line'
                        }`}
                    >
                        {period.label}
                    </button>
                );
            })}
        </div>
    );
};

export default TimePicker;
