import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AllDeviceDataPage from './pages/AllDeviceData/AllDeviceDataPage';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import LocationConfigurationPage from './pages/LocationConfiguration/LocationConfigurationPage';
import SummaryPage from './pages/Summary/SummaryPage';
import { AppBar, Toolbar, Typography } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import DeviceDetail from './pages/DeviceDetail/DeviceDetailPage';
import { Link } from 'react-router-dom';
import DoorcamPage from './pages/doorcam/Doorcam';


const App = () => {

  const navigation = () => {
    return (
        <AppBar position="static">
        <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>Weather Station</Typography>
                <MenuItem component={Link} to="/">Home</MenuItem>
                <MenuItem component={Link} to="/locations">Locations</MenuItem>
                <MenuItem component={Link} to="/camera-stream">Camera Stream</MenuItem>
        </Toolbar>
      </AppBar>
    )
  }  
  return (
    <Router>
        {navigation()}
      <Routes>
        <Route exact path="/" element={<SummaryPage/>} />
        <Route exact path="/all-device-data" element={<AllDeviceDataPage/>} />
        <Route exact path={"/device/:deviceUid"} element={<DeviceDetail/>} />
        <Route exact path={"/locations"} element={<LocationConfigurationPage/>} />
        <Route exact path={"/camera-stream"} element={<DoorcamPage/>} />
        <Route path="*" element={<NotFoundPage/>} />
      </Routes>
    </Router>
  );
}

export default App;