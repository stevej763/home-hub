import { API_BASE_URL } from '../config';
import type { Location } from './types';

const getLocations = async (): Promise<Location[]> => {
    try {
        console.log('getting locations');
        return await fetch(`${API_BASE_URL}/locations`)
            .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};

const createLocation = async (locationName: string): Promise<unknown> => {
    try {
        console.log('creating location');
        return await fetch(`${API_BASE_URL}/locations/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: locationName })

        })
            .then((response) => response.json());
    } catch (error) {
        console.error('Error fetching devices:', error);
        return [];
    }
};

export { getLocations, createLocation };
