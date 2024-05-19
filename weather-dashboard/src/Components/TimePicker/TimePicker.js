import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import './TimePicker.css';

const TimePicker = ({timePeriod, updateTimePeriod}) => {
    return (
     <div className='timePicker'>
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
         <InputLabel id="time-picker-label">Time Period</InputLabel>
         <Select
           labelId="time-picker-label"
           label="Time Period"
           id="select-time-period"
           value={timePeriod}
           onChange={(e) => updateTimePeriod(e.target.value)}>
           <MenuItem value={1}>One Hour</MenuItem>
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

export default TimePicker;