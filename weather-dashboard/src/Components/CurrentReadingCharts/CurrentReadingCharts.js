import { Gauge, gaugeClasses } from '@mui/x-charts';
import './CurrentReadingCharts.css';
import { Typography } from '@mui/material';
import Card from '@mui/material/Card';

const CurrentReadingCharts = ({ 
    reading,
    width = 200,
    height = 200,
 }) => {
  
  const hpaToatmRatio = 0.0009869233;

  const createChart = (data, min, max, textFormatter) => {
    return (
    <Gauge
    width={width}
    height={height}
    value={data}
    text={({ value }) => textFormatter(value)}
    valueMin={min}
    valueMax={max}
    startAngle={0}
    endAngle={360}
    innerRadius={'90%'}
    sx={{
      [`& .${gaugeClasses.valueText}`]: {
        fontSize: 15,
      },
    }}
  />
    )
  }

const formatTemperature = (value) => {
  return value + "°C";
}

const formatPressure = (value) => {
  return value + "atm";
}

const formatHumidity = (value) => {
  return value + "%";
}

const formatPressureFloat = (value) => {
  return parseFloat((parseFloat(value) * hpaToatmRatio).toFixed(3))
}

const renderCurrentDataCharts = (reading) => {    
  if (!reading) return (<div></div>);
  const formattedTemperature = reading.temperature ? parseFloat(reading.temperature) : 0 
  const formattedHumidity = reading.humidity ? parseFloat(reading.humidity) : 0
  const formattedPressure = reading.pressure ? formatPressureFloat(reading.pressure) : 0
  return (
    <div className='gauge-box'>
      <Card elevation={2} className='gauge'>
        <Typography variant='body'>Temperature</Typography>
        {createChart(formattedTemperature, 0, 50, formatTemperature)}
      </Card>
      <Card elevation={2} className='gauge'>
        <Typography variant='body'>Humidity</Typography>
          {createChart(formattedHumidity, 0, 100, formatHumidity)}
      </Card>
      <Card elevation={2} className='gauge'>
        <Typography variant='body'>Pressure</Typography>
          {createChart(formattedPressure, 0, 1, formatPressure)}
      </Card>
    </div>
  )
}

  return (
    <div className='gauge-box'>
      {renderCurrentDataCharts(reading)}
    </div>
  )
}



export default CurrentReadingCharts;