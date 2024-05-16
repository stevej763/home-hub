import './AllDeviceDataPage.css';
import React, { useEffect, useState } from 'react';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { BarChart } from '@mui/x-charts/BarChart';
import { Button } from '@mui/material';
import { Gauge } from '@mui/x-charts';
import { LineChart } from '@mui/x-charts/LineChart';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

const AllDeviceData = () => {


  const defaultHours = 23;
  const defaultUpdateInterval = 60000;
  const getInterval = (hours) => {
    const to = new Date();
    const from = new Date()
    from.setHours(from.getHours() - hours);
    const interval = {'from': from.toISOString(), 'to': to.toISOString()}
    return interval;
  }

  const [devices, setDevices] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [pressureData, setPressureData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [timePeriod, setTimePeriod] = useState(defaultHours);
  const [updateInterval, setUpdateInterval] = useState(defaultUpdateInterval);

  const fetchDevices = async () => {
    try {
      const response = await fetch('http://localhost:3001/devices');
      const data = await response.json();
      setDevices(data)
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const response = await fetch('http://localhost:3001/readings/latest');
        const data = await response.json();
        setCurrentData(data);
      } catch (error) {
        console.error('Error fetching latest data:', error);
      }
    }
    fetchLatestData();
    const intervalId = setInterval(fetchLatestData, updateInterval);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchTemperature = async () => {
      console.log("Update interval: ", updateInterval)
      const timeInterval = getInterval(timePeriod);
      try {
        const response = await fetch(`http://localhost:3001/readings/temperature/interval?from=${timeInterval.from}&to=${timeInterval.to}`);
        const data = await response.json();
        setTemperatureData(data)
      } catch (error) {
        console.error('Error fetching temperature data:', error);
      }
    }
    fetchTemperature();
    const intervalId = setInterval(fetchTemperature, updateInterval);
    return () => clearInterval(intervalId);
  }, [timePeriod, updateInterval]);

  useEffect(() => {
    const timeInterval = getInterval(timePeriod);
    const fetchHumidity = async () => {
      try {
        const response = await fetch(`http://localhost:3001/readings/humidity/interval?from=${timeInterval.from}&to=${timeInterval.to}`);
        const data = await response.json();
        setHumidityData(data)
      } catch (error) {
        console.error('Error fetching humidity data:', error);
      }
    }
    fetchHumidity();
    const intervalId = setInterval(fetchHumidity, updateInterval);
    return () => clearInterval(intervalId);
  }, [timePeriod, updateInterval]);

  useEffect(() => {
    const timeInterval = getInterval(timePeriod);
    const fetchPressure = async () => {
      try {
        const response = await fetch(`http://localhost:3001/readings/pressure/interval?from=${timeInterval.from}&to=${timeInterval.to}`);
        const data = await response.json();
        setPressureData(data)
      } catch (error) {
        console.error('Error fetching pressure data:', error);
      }
    }
    fetchPressure();
    const intervalId = setInterval(fetchPressure, 5000);
    return () => clearInterval(intervalId);
  }, [timePeriod, updateInterval]);


  const deleteDevice = async (device_uid) => {
    console.log('Deleting device:', device_uid);
    try {
      const response = await fetch(`http://localhost:3001/devices/${device_uid}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDevices(devices.filter(d => d.device_uid !== device_uid));
      }
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  }

  const enableDevice = async (device_uid) => {
    console.log('Enabling device:', device_uid);
    try {
      const response = await fetch(`http://localhost:3001/devices/activate/${device_uid}`, {
        method: 'POST',
      });
      if (response.ok) {
        const device = devices.find(d => d.device_uid === device_uid);
        device.status = 'ONLINE';
        setDevices([...devices]);
      }
    } catch (error) {
      console.error('Error enabling device:', error);
    }
  };

  const clearData = async (device_uid) => {
    console.log('Clearing data for device: ', device_uid);
    try {
      const response = await fetch(`http://localhost:3001/devices/clear/${device_uid}`, {
        method: 'POST',
      });
      if (response.ok) {
        console.log("Should have cleared data for device: ", device_uid)
      }
    } catch (error) {
      console.error('Error disabling device:', error);
    }
  }

  const renderDevices = () => {
    return devices.map(device => (
      <div key={device.device_uid} className='device'>
        <Card variant="outlined">
          <CardContent>
            <h2>{device.device_name}</h2>
            <p>{device.ip_address}</p>
            <p>{device.device_uid}</p>
            <Chip label={device.status} color="primary"/>
            <Button variant="contained" color="error" onClick={() => deleteDevice(device.device_uid)}>Delete device</Button>
            <Button variant="contained" color="secondary" onClick={() => enableDevice(device.device_uid)}>Enable</Button>
            <Button variant="contained" color="warning" onClick={() => clearData(device.device_uid)}>Clear data</Button>
            {renderCurrentDataCharts(device)}
            {renderCharts(device)}
          </CardContent>
        </Card>
      </div>
    ));
  }

  const buildChart = (data, title) => {
    const timestamps = data.map(reading => reading.timestamp);
    const values = data.map(reading => reading.average_reading);

    return (
      <div className='chart'>
        <BarChart 
          xAxis={[
            {
              id: 'barCategories',
              data: timestamps,
              scaleType: 'band',
              label: 'time'
            }
          ]}
          series={[
            {
          data: values,
          label: title,
            },
          ]}
          width={500}
          height={300}
          />
          <h2>{title}</h2>
        </div>
    )
  }

  const testLineChart = (data) => {
    const timestamps = data.map(reading => reading.timestamp);
    const values = data.map(reading => reading.average_reading);
        return (<LineChart
          xAxis={[
            {
              id: 'barCategories',
              data: timestamps,
              scaleType: 'band',
            }
          ]}
          series={[
            {
          data: values,
            },
          ]}
        width={500}
        height={300}
      />
        )
  }

  const renderCharts = (device) => {
    const temperature = temperatureData.filter((data) => data.device_uid === device.device_uid).reverse();
    const humidity = humidityData.filter((data) => data.device_uid === device.device_uid).reverse();
    const pressure = pressureData.filter((data) => data.device_uid === device.device_uid).reverse();

    return (
      <div className='charts'>
        {buildChart(temperature, 'Temperature (°C)')}
        {buildChart(humidity, 'Humidity (%)')}
        {buildChart(pressure, 'Pressure (hPa)')}
      </div>

    )
  }

  const renderCurrentDataCharts = (device) => {    
    const deviceLatest = currentData.filter((data) => data.device_uid === device.device_uid) 
    if (deviceLatest.length === 0) return (<div></div>);
    const formattedTemperature = deviceLatest[0].temperature ? parseFloat(deviceLatest[0].temperature) : 0 
    const formattedHumidity = deviceLatest[0].humidity ? parseFloat(deviceLatest[0].humidity) : 0
    const formattedPressure = deviceLatest[0].pressure ? parseFloat(deviceLatest[0].pressure) : 0
    return (
      <div className='gauge-box'>
        <div className='gauge'>
          <Gauge
            value={formattedTemperature}
            width={200}
            height={100}
            min={0}
            max={100}
            startAngle={-90}
            endAngle={90}
          />
          <p>Temperature</p>
        </div>
        <div className='gauge'>
          <Gauge
            value={formattedHumidity}
            width={200}
            height={100}
            min={0}
            max={100}
            startAngle={-90}
            endAngle={90}
          />
          <p>Humidity</p>
        </div>
        <div className='gauge'>
          <Gauge
            value={formattedPressure}
            width={200}
            height={100}
            min={0}
            max={10}
            startAngle={-90}
            endAngle={90}
          />
          <p>Pressure</p>
        </div>
      </div>
    )
  }

  const renderTimePicker = () => {
   return (
    <div className='time-picker'>
       <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
        <InputLabel id="time-picker-label">Time Period</InputLabel>
        <Select
          labelId="time-picker-label"
          label="Time Period"
          id="select-time-period"
          value={timePeriod}
          onChange={(e) => setTimePeriod(e.target.value)}>
          <MenuItem value={0}>One Hour</MenuItem>
          <MenuItem value={1}>Two Hours</MenuItem>
          <MenuItem value={3}>Four Hours</MenuItem>
          <MenuItem value={7}>Eight Hours</MenuItem>
          <MenuItem value={11}>Twelve Hours</MenuItem>
          <MenuItem value={23}>One Day</MenuItem>
          <MenuItem value={167}>One Week</MenuItem>
          <MenuItem value={719}>One Month</MenuItem>
          <MenuItem value={8759}>One Year</MenuItem>
        </Select>
      </FormControl>
    </div>
   )
  }

  const renderUpdateInterval = () => {
    return (
      <div className='update-interval'>
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel id="update-interval-label">Update Interval</InputLabel>
          <Select
            labelId="update-interval-label"
            label="Update Interval"
            id="select-update-interval"
            value={updateInterval}
            onChange={(e) => setUpdateInterval(e.target.value)}>
            <MenuItem value={1000}>1 Second</MenuItem>
            <MenuItem value={5000}>5 Seconds</MenuItem>
            <MenuItem value={10000}>10 Seconds</MenuItem>
            <MenuItem value={60000}>1 Minute</MenuItem>
            <MenuItem value={300000}>5 Minutes</MenuItem>
            <MenuItem value={600000}>10 Minutes</MenuItem>
            <MenuItem value={900000}>15 Minutes</MenuItem>
            <MenuItem value={1200000}>20 Minutes</MenuItem>
            <MenuItem value={1500000}>25 Minutes</MenuItem>
            <MenuItem value={1800000}>30 Minutes</MenuItem>
          </Select>
        </FormControl>
      </div>
    )
  }

  return (
    <div className="App">
        {renderTimePicker()}
        {renderUpdateInterval()}
        <div className='devices'>
        {renderDevices()}
        </div>
    </div>
  );
};


export default AllDeviceData;
