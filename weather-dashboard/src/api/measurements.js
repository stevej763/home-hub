const apiServer = process.env.REACT_APP_API_SERVER;
const port = process.env.REACT_APP_API_PORT;


const getTemperatureData = async (deviceUid, from, to) => {
    try {
        return await fetch(`http://${apiServer}:${port}/readings/temperature/interval/${deviceUid}?from=${from}&to=${to}`)
        .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return []
    }
}

const getPressureData = async (deviceUid, from, to) => {
    try {
        return await fetch(`http://${apiServer}:${port}/readings/pressure/interval/${deviceUid}?from=${from}&to=${to}`)
        .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return []
    }
}

const getHumidityData = async (deviceUid, from, to) => {
    try {
        return await fetch(`http://${apiServer}:${port}/readings/humidity/interval/${deviceUid}?from=${from}&to=${to}`)
        .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return []
    }
}

export { getTemperatureData, getHumidityData, getPressureData };