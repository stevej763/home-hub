import { useEffect, useState } from 'react';
import { getTemperatureData, getHumidityData, getPressureData } from '../../api/measurements';
import { BarChart } from '@mui/x-charts';

const BarCharts = ({deviceUid}) => {

    const defaultHours = 23;
    const defaultUpdateInterval = 60000;
    const getInterval = (hours) => {
      const to = new Date();
      const from = new Date()
      from.setHours(from.getHours() - hours);
      const interval = {'from': from.toISOString(), 'to': to.toISOString()}
      console.log('interval:', interval)
      return interval;
    }

    const [temperatureData, setTemperatureData] = useState([]);
    const [humidityData, setHumidityData] = useState([]);
    const [pressureData, setPressureData] = useState([]);
    const [timePeriod, setTimePeriod] = useState(defaultHours);
    const [updateInterval, setUpdateInterval] = useState(defaultUpdateInterval);


    useEffect(() => {
        if (!deviceUid) {
            return;
        }
        const fetchTemperature = async () => {
          const timeInterval = getInterval(timePeriod);
          try {
            const data = await getTemperatureData(deviceUid, timeInterval.from, timeInterval.to);
            setTemperatureData(data)
            console.log('temperature:', data)
          } catch (error) {
            console.error('Error fetching temperature data:', error);
          }
        }
        fetchTemperature();
        const intervalId = setInterval(fetchTemperature, updateInterval);
        return () => clearInterval(intervalId);
      }, [timePeriod, updateInterval]);

      useEffect(() => {
        if (!deviceUid) {
            return;
        }
        const fetchPressure = async () => {
          const timeInterval = getInterval(timePeriod);
          try {
            const data = await getPressureData(deviceUid, timeInterval.from, timeInterval.to);
            setPressureData(data)
          } catch (error) {
            console.error('Error fetching temperature data:', error);
          }
        }
        fetchPressure();
        const intervalId = setInterval(fetchPressure, updateInterval);
        return () => clearInterval(intervalId);
      }, [timePeriod, updateInterval]);

      useEffect(() => {
        if (!deviceUid) {
            return;
        }
        const fetchHumidity = async () => {
          const timeInterval = getInterval(timePeriod);
          try {
            const data = await getHumidityData(deviceUid, timeInterval.from, timeInterval.to);
            setHumidityData(data)
          } catch (error) {
            console.error('Error fetching temperature data:', error);
          }
        }
        fetchHumidity();
        const intervalId = setInterval(fetchHumidity, updateInterval);
        return () => clearInterval(intervalId);
      }, [timePeriod, updateInterval]);


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
      const renderCharts = () => {    
        return (
          <div className='charts'>
            {buildChart(temperatureData, 'Temperature (°C)')}
            {buildChart(humidityData, 'Humidity (%)')}
            {buildChart(pressureData, 'Pressure (hPa)')}
          </div>
    
        )
      }

      return (
        renderCharts()
      )
}

export default BarCharts;