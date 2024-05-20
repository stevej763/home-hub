const apiServer = process.env.REACT_APP_API_SERVER;
const port = process.env.REACT_APP_API_PORT;

const getLocations = async () => {
    try {
        console.log('getting locations')
        return await fetch(`http://${apiServer}:${port}/locations`)
        .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return []
    }
}

const createLocation = async (locationName) => {
    try {
        console.log('creating location')
        return await fetch(`http://${apiServer}:${port}/locations/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: locationName})
        
        })
        .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return []
    }
}

export { getLocations, createLocation };