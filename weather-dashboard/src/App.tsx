import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AllDeviceDataPage from './pages/AllDeviceData/AllDeviceDataPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import LocationConfigurationPage from './pages/LocationConfiguration/LocationConfigurationPage';
import SummaryPage from './pages/Summary/SummaryPage';
import DeviceDetail from './pages/DeviceDetail/DeviceDetailPage';
import DeviceInfoPage from './pages/DeviceDetail/DeviceInfoPage';

const NAV_LINKS = [
    { to: '/', label: 'Stations', end: true },
    { to: '/locations', label: 'Locations' },
    { to: '/all-device-data', label: 'Control room' },
];

const StationClock = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000 * 30);
        return () => clearInterval(id);
    }, []);
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' });
    return (
        <div className="hidden sm:flex flex-col items-end font-mono leading-tight">
            <span className="text-face text-sm tabular-nums">{time}</span>
            <span className="text-face/50 text-[10px] uppercase tracking-widest">{date}</span>
        </div>
    );
};

const Navigation = () => (
    <header className="sticky top-0 z-30 bg-panel/95 backdrop-blur border-b border-brass/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
            <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
                <img src="/logo-nav.png" alt="" className="h-8 w-8 rounded-md shadow-[0_0_8px_2px_rgba(184,134,58,0.3)]" />
                <span className="font-display font-semibold uppercase tracking-[0.12em] text-face text-lg">
                    Home Hub <span className="text-brass">Weather</span>
                </span>
            </NavLink>
            <nav className="flex items-center gap-1 font-display uppercase tracking-[0.08em] text-sm">
                {NAV_LINKS.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-sm transition-colors ${
                                isActive
                                    ? 'text-panel bg-brass'
                                    : 'text-face/70 hover:text-face hover:bg-panel-raised'
                            }`
                        }
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>
            <StationClock />
        </div>
    </header>
);

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navigation />
                    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
                        <Routes>
                            <Route path="/" element={<SummaryPage />} />
                            <Route path="/device/:deviceUid" element={<DeviceDetail />} />
                            <Route path="/all-device-data" element={<AllDeviceDataPage />} />
                            <Route path="/all-device-data/:deviceUid" element={<DeviceInfoPage />} />
                            <Route path="/locations" element={<LocationConfigurationPage />} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </ThemeProvider>
    );
};

export default App;
