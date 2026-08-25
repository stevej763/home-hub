export type DeviceStatus =
  | 'REGISTERED'
  | 'CALIBRATING'
  | 'READY'
  | 'ACTIVE'
  | 'DISABLED'
  | 'OFFLINE'
  | 'RETIRED';

// GET /devices joins in location_name; GET /devices/:id does not, so it's
// only reliably present when the device came from the list endpoint.
export interface Device {
  id: string;
  device_uid: string;
  device_name: string;
  hostname: string | null;
  ip_address: string;
  status: DeviceStatus;
  location_uid: string | null;
  location_name?: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  location_uid: string;
  location_name: string;
  created_at: string;
  updated_at: string;
}

export interface LatestReadings {
  device_name?: string;
  device_uid?: string;
  temperature?: string | null;
  temperature_timestamp?: string | null;
  humidity?: string | null;
  humidity_timestamp?: string | null;
  pressure?: string | null;
  pressure_timestamp?: string | null;
}

export interface IntervalReading {
  timestamp: string;
  device_uid: string;
  device_name: string;
  average_reading: string;
}
