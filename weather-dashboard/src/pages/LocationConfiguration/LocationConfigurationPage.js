import { useEffect, useState } from 'react';
import { getLocations } from '../../api/locations';
import { LocationCreationModal } from '../../Components/Modal/LocationCreationModal';

const LocationConfigurationPage = () => {
    const [locations, setLocations] = useState([]);
    const [open, setOpen] = useState(false);

    const fetchLocations = async () => {
        const result = await getLocations();
        setLocations(result);
    };

    useEffect(() => {
        fetchLocations();
    }, []);

    const handleClose = () => {
        setOpen(false);
        fetchLocations();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="font-display font-semibold uppercase tracking-wide text-face text-2xl">
                        Locations
                    </h1>
                    <p className="font-mono text-xs text-face/50 mt-1">
                        Rooms and areas stations can be assigned to.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="font-mono text-xs uppercase tracking-widest px-4 py-2 rounded-sm bg-brass text-panel font-medium hover:bg-brass-light transition-colors"
                >
                    + Add location
                </button>
            </div>

            {locations.length === 0 ? (
                <div className="bg-face rounded-md shadow-face p-10 text-center">
                    <p className="font-mono text-sm text-ink-soft uppercase tracking-widest">
                        No locations yet
                    </p>
                    <p className="font-body text-ink-soft/70 mt-1 text-sm">
                        Add one to start assigning stations to rooms.
                    </p>
                </div>
            ) : (
                <ul className="bg-face rounded-md shadow-face divide-y divide-ink/10 overflow-hidden">
                    {locations.map((location) => (
                        <li
                            key={location.location_uid}
                            className="flex items-center gap-3 px-5 py-3.5 font-body text-ink"
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-brass shrink-0" />
                            {location.location_name}
                        </li>
                    ))}
                </ul>
            )}

            <LocationCreationModal show={open} handleClose={handleClose} />
        </div>
    );
};

export default LocationConfigurationPage;
