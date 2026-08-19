import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-24">
            <div className="relative h-28 w-28 mb-6">
                <svg viewBox="0 0 120 120" width={112} height={112}>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#2A3236" strokeWidth={7} />
                    <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="#B8503A"
                        strokeWidth={7}
                        strokeLinecap="round"
                        strokeDasharray="18 12"
                        opacity={0.8}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-mono text-face/70 text-sm">
                    404
                </div>
            </div>
            <h1 className="font-display font-semibold uppercase tracking-wide text-face text-2xl">
                No signal from this station
            </h1>
            <p className="font-mono text-sm text-face/50 mt-2 max-w-sm">
                That page doesn't exist, or the station moved. Check the address, or head back to the summary.
            </p>
            <Link
                to="/"
                className="mt-6 font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm bg-brass text-panel font-medium hover:bg-brass-light transition-colors"
            >
                Back to stations
            </Link>
        </div>
    );
};

export default NotFoundPage;
