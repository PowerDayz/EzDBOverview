import React, { useState, useEffect } from 'react';
import { Avatar, Typography, Grid, Paper, Button, styled, Badge } from '@mui/material';
import { Tab, Tabs, Box } from '@mui/material';
import { ChangeEvent } from 'react';
import { formatMoney, getRandomColor } from '../utils/helpers';
import InventoryModal from './InventoryModal';
import MapModal from './MapModal';
import VehicleModal from './VehicleModal';

interface PlayerDataItem {
  inventory: string;
  metadata: string;
  position: string;
  gang: string;
  job: string;
  charinfo: string;
  money: string;
  license: string;
  cid: string;
  citizenid: string;
  id: number;
  name: string;
  vehicles: string;
  pfp: string;
  house_coords?: string[] | { x: number; y: number; z: number; }[];
}

interface TabPanelProps {
  children: React.ReactNode;
  value: number;
  index: number;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function PlayerCard({ item, darkMode, onlinePlayers }: { item: PlayerDataItem, darkMode: boolean, onlinePlayers: PlayerDataItem[], house_coords: string[] | { x: number; y: number; z: number; }[] }) {
  const [expanded, setExpanded] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [avatarColor, setAvatarColor] = useState<string>('');

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: ChangeEvent<{}>, newValue: number) => {
    event.stopPropagation();
    setTabValue(newValue);
  };

  useEffect(() => {
    setAvatarColor(getRandomColor()); /* This makes sure the icon only changes color when page is loaded/reloaded */
  }, []);

  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOpenInventory = (e: React.MouseEvent) => {
    e.stopPropagation(); // Makes sure the PlayerCard doesn't close when clicking the button
    setInventoryOpen(true);
  };  

  const handleCloseInventory = () => {
    setInventoryOpen(false);
  };

  const handleOpenMap = (e: React.MouseEvent) => {
    e.stopPropagation(); // Makes sure the PlayerCard doesn't close when clicking the button
    setMapOpen(true);
  };
  
  const handleCloseMap = () => {
    setMapOpen(false);
  };

  const handleOpenVehicle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVehicleOpen(true);
  };
  
  const handleCloseVehicle = () => {
    setVehicleOpen(false);
  };

  const [position, setPosition] = useState({x: 0, y: 0, z: 0});

  useEffect(() => {
    const pos = JSON.parse(item.position);
    setPosition(pos);
  }, [item.position]);

  // data ig lmao
  const moneyData = JSON.parse(item.money);

  const jobData = typeof item.job === 'string' ? JSON.parse(item.job) : item.job;
  const jobLabel = jobData.label;
  const gradeLabel = jobData.grade.name;

  const gangData = typeof item.gang === 'string' ? JSON.parse(item.gang) : item.gang;
  const gangLabel = gangData.label;
  const gangGradeLabel = gangData.grade.name;

  const metadata = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;

  const charInfo = typeof item.charinfo === 'string' ? JSON.parse(item.charinfo) : item.charinfo;

  const isOnline = onlinePlayers.some(player => player.citizenid === item.citizenid);

  const hasPfp = item.pfp && item.pfp !== "";

  const transformedHouseCoords = typeof item.house_coords === 'string' 
  ? JSON.parse(item.house_coords) 
  : item.house_coords; 

  if (!item.license) {
    return null;
  }
  
  return (
    <>
      <Paper elevation={3} 
        style={{ 
          padding: expanded ? 30 : 10, 
          marginBottom: 10,
          width: expanded ? '100%' : 'auto',
          height: expanded ? 400 : 'auto', // honestly looks better with a fixed height
          transition: 'all 0.6s ease' 
        }}
        onClick={() => setExpanded(!expanded)}>
        <Grid container spacing={2}>
          <Grid item container xs={12} justifyContent="space-between">
            {isOnline ? (
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
              >
                {hasPfp ? (
                  <Avatar src={item.pfp}>{charInfo.firstname[0].toUpperCase()}</Avatar>
                ) : (
                  <Avatar sx={{ bgcolor: avatarColor }}>{charInfo.firstname[0].toUpperCase()}</Avatar>
                )}
              </StyledBadge>
            ) : (
              hasPfp ? (
                <Avatar src={item.pfp}>{charInfo.firstname[0].toUpperCase()}</Avatar>
              ) : (
                <Avatar sx={{ bgcolor: avatarColor }}>{charInfo.firstname[0].toUpperCase()}</Avatar>
              )
            )}
            <Typography variant="h6" component="div" onClick={handleTextMouseDown}>{charInfo.firstname} {charInfo.lastname}</Typography>
            <Typography variant="h5" component="div" onClick={handleTextMouseDown}>{item.name}</Typography>
          </Grid>
          {expanded && (
            <>
              <Grid
                item
                xs={12}
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  marginBottom: 2,
                }}
              >
                <Tabs value={tabValue} onChange={handleTabChange}>
                  <Tab label="Details" />
                  <Tab label="Economics & Job" />
                  <Tab label="License & Misc" />
                  <Tab label="Character Info" />
                </Tabs>
              </Grid>

              <TabPanel value={tabValue} index={0}>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Citizen ID:</strong> {item.citizenid}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Char Slot:</strong> {item.cid}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>License:</strong> {item.license}</Typography>
                <Button onClick={handleOpenMap}>Open Map</Button>
                <Button onClick={handleOpenInventory}>Open Inventory</Button>
                <Button onClick={handleOpenVehicle}>Open Vehicles</Button>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Typography className="truncate" onClick={handleTextMouseDown}>
                  <strong>Cash:</strong> {formatMoney(moneyData.cash, 'USD')}
                </Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}>
                  <strong>Bank:</strong> {formatMoney(moneyData.bank)}
                </Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}>
                  <strong>Crypto:</strong> {formatMoney(moneyData.crypto, 'BTC', true)}
                </Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Job:</strong> {jobLabel} - {gradeLabel}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Gang:</strong> {gangLabel} - {gangGradeLabel}</Typography>
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Blood Type:</strong> {metadata.bloodtype}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Callsign:</strong> {metadata.callsign}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Stress:</strong> {metadata.stress}%</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Hunger:</strong> {metadata.hunger.toFixed(2)}%</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Thirst:</strong> {metadata.thirst.toFixed(2)}%</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Driver License:</strong> {metadata.licences.driver ? 'Yes' : 'No'}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Weapon License:</strong> {metadata.licences.weapon ? 'Yes' : 'No'}</Typography>
              </TabPanel>
              <TabPanel value={tabValue} index={3}>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>First Name:</strong> {charInfo.firstname}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Last Name:</strong> {charInfo.lastname}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Birthdate:</strong> {charInfo.birthdate}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Nationality:</strong> {charInfo.nationality}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Phone:</strong> {charInfo.phone}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Gender:</strong> {charInfo.gender === 0 ? 'Male' : 'Female'}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Backstory:</strong> {charInfo.backstory}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Account:</strong> {charInfo.account}</Typography>
              </TabPanel>
            </>
          )}
        </Grid>
      </Paper>
          
      <InventoryModal
        inventory={JSON.parse(item.inventory)}
        open={inventoryOpen}
        handleClose={handleCloseInventory}
        darkMode={darkMode}
        onClose={(event: React.SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => {
          if (reason === "backdropClick") {
            event.stopPropagation();
          }
        }}
      />

      <MapModal
        open={mapOpen}
        handleClose={handleCloseMap}
        position={position}
        darkMode={darkMode}
        house_coords={transformedHouseCoords}
      />

      <VehicleModal
        open={vehicleOpen}
        handleClose={handleCloseVehicle}
        vehicles={Array.isArray(item.vehicles) ? item.vehicles : JSON.parse(item.vehicles)}
        darkMode={darkMode}
      />
    </>
  );
}

export default PlayerCard;