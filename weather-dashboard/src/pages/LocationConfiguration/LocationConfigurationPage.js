import { useEffect, useState } from "react";
import { getLocations } from "../../api/locations";
import { Button } from "@mui/material";
import { LocationCreationModal } from "../../Components/Modal/LocationCreationModal";

const LocationConfigurationPage = () => {

    const [locations, setLocations] = useState([]);
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        fetchLocations();
    }

    const fetchLocations = async () => {
        const locations = await getLocations();
        setLocations(locations);
    }

    useEffect(() => {
        const fetchLocations = async () => {
            const locations = await getLocations();
            setLocations(locations);
        }
        fetchLocations();
    }, [])


    return (
        <div>
            <h1>Locations</h1>
            <Button variant="contained" color="primary" onClick={handleOpen}>Add Location</Button>
            <ul>
                {locations.map((location) => {
                    return <li key={location.location_uid}>{location.location_name}</li>
                })}
            </ul>
            <LocationCreationModal show={open} handleClose={handleClose}/>
        </div>
    )

} 

export default LocationConfigurationPage;