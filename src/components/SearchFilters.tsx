import React from 'react';
import { Chip } from '@mui/material';

type FilterState = {
  online?: boolean;
  job?: string;
};

function SearchFilters( {SearchFilter, setSearchFilter, darkMode, theme}: {SearchFilter: any, setSearchFilter: any, darkMode: boolean, theme: any}) {
  return (
    <>
      <Chip 
        label="Online Players" 
        clickable 
        color={SearchFilter.online ? 'secondary' : 'default'}
        onClick={() => setSearchFilter((prev: FilterState) => ({ ...prev, online: !prev.online }))}
        sx={{ color: darkMode ? '#fff' : '#000' }} 
      />

      <Chip 
        label="Police" 
        clickable 
        color={SearchFilter.job === 'police' ? 'secondary' : 'default'}
        onClick={() => setSearchFilter((prev: FilterState) => ({ ...prev, job: prev.job === 'police' ? undefined : 'police' }))}
        sx={{ color: darkMode ? '#fff' : '#000', marginLeft: theme.spacing(1) }} 
      />


      <Chip 
        label="EMS/Doctor" 
        clickable 
        color={SearchFilter.job === 'ambulance' ? 'secondary' : 'default'}
        onClick={() => setSearchFilter((prev: FilterState) => ({ ...prev, job: prev.job === 'ambulance' ? undefined : 'ambulance' }))}
        sx={{ color: darkMode ? '#fff' : '#000', marginLeft: theme.spacing(1) }} 
      />
  
      <Chip 
        label="Mechanic" 
        clickable 
        color={SearchFilter.job === 'mechanic' ? 'secondary' : 'default'}
        onClick={() => setSearchFilter((prev: FilterState) => ({ ...prev, job: prev.job === 'mechanic' ? undefined : 'mechanic' }))}
        sx={{ color: darkMode ? '#fff' : '#000', marginLeft: theme.spacing(1) }} 
      />
  
      <Chip 
        label="Real Estate" 
        clickable 
        color={SearchFilter.job === 'realtor' ? 'secondary' : 'default'}
        onClick={() => setSearchFilter((prev: FilterState) => ({ ...prev, job: prev.job === 'realtor' ? undefined : 'realtor' }))}
        sx={{ color: darkMode ? '#fff' : '#000', marginLeft: theme.spacing(1) }} 
      />
  
      <Chip 
        label="Car Dealer" 
        clickable 
        color={SearchFilter.job === 'cardealer' ? 'secondary' : 'default'}
        onClick={() => setSearchFilter((prev: FilterState) => ({ ...prev, job: prev.job === 'cardealer' ? undefined : 'cardealer' }))}
        sx={{ color: darkMode ? '#fff' : '#000', marginLeft: theme.spacing(1) }} 
      />
  
      {/*<Chip 
        label="JOB LABEL HERE" 
        clickable 
        color={SearchFilter.job === 'CHANGETHISJOB' ? 'secondary' : 'default'}
        onClick={() => setSearchFilter((prev: FilterState) => ({ ...prev, job: prev.job === 'CHANGETHISJOB' ? undefined : 'CHANGETHISJOB' }))}
        sx={{ color: darkMode ? '#fff' : '#000', marginLeft: theme.spacing(1) }} 
      />*/}
    </>
  )
}

export default SearchFilters;