import { API_BASE_URL } from '../config';
import type { IntervalReading } from './types';

const getTemperatureData = async (deviceUid: string, from: string, to: string): Promise<IntervalReading[]> => {
    try {
        return await fetch(`${API_BASE_URL}/readings/temperature/interval/${deviceUid}?from=${from}&to=${to}`)
            .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};

const getPressureData = async (deviceUid: string, from: string, to: string): Promise<IntervalReading[]> => {
    try {
        return await fetch(`${API_BASE_URL}/readings/pressure/interval/${deviceUid}?from=${from}&to=${to}`)
            .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};

const getHumidityData = async (deviceUid: string, from: string, to: string): Promise<IntervalReading[]> => {
    try {
        return await fetch(`${API_BASE_URL}/readings/humidity/interval/${deviceUid}?from=${from}&to=${to}`)
            .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};

export { getTemperatureData, getHumidityData, getPressureData };
