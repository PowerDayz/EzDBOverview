import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography, Avatar, createTheme, IconButton, ThemeProvider, CssBaseline, AppBar, Toolbar, Button, TextField, Tooltip, ButtonBase, Badge, styled } from '@mui/material';
import { Brightness4, Brightness7, Analytics } from '@mui/icons-material';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Tooltip as RechartsTooltip } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

interface DataItem {
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
}

interface Vehicle {
  vehicle: string;
  plate: string;
  garage: string;
  fuel: number;
  engine: number;
  body: number;
  drivingdistance: string;
  mods: {
    [key: string]: number;
  };
}

interface VehicleModalProps {
  open: boolean;
  vehicles: Vehicle[];
  handleClose: () => void;
  darkMode: boolean;
  onClose?: (event: React.SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => void;
}

type AnalyticsData = {
  richestPlayer: string;
  richestPlayerMoney: number;
  totalMoney: number;
  averageMoney: number;
  totalPlayers: number;
  jobWealth: {
      job: string;
      averageWealth: number;
  }[];
};

type JobWealthData = {
  totalWealth: number;
  count: number;
  averageWealth: number;
};

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

function getWealthPerJob(data: DataItem[]) {
  return data.reduce((acc, item) => {
    const jobData = typeof item.job === 'string' ? JSON.parse(item.job) : item.job;
    const jobLabel = jobData.label;
    const moneyData = typeof item.money === 'string' ? JSON.parse(item.money) : item.money;
    const totalWealth = moneyData.bank + moneyData.cash;

    if (!acc[jobLabel]) {
      acc[jobLabel] = {
        totalWealth: 0,
        count: 0,
        averageWealth: 0
      };
    }

    acc[jobLabel].totalWealth += totalWealth;
    acc[jobLabel].count += 1;
    acc[jobLabel].averageWealth = acc[jobLabel].totalWealth / acc[jobLabel].count;

    return acc;
  }, {} as Record<string, JobWealthData>);
}

function AnalyticsModal({ open, handleClose, data, darkMode }: { open: boolean, handleClose: () => void, data: AnalyticsData, darkMode: boolean }) {
  const dataForBarChart = [
    { name: 'Richest Player', value: data.richestPlayerMoney },
    { name: 'Average Wealth', value: data.averageMoney },
  ];
  
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="analytics-modal-title"
      aria-describedby="analytics-modal-description"
      sx={{ overflowY: 'scroll' }}
    >
      <Box 
        style={{ 
          width: '60%', 
          margin: '5% auto', 
          backgroundColor: darkMode ? 'rgb(51,51,51,0.8)' : 'rgb(255,255,255,0.8)', 
          padding: '20px', 
          outline: 'none', 
          color: darkMode ? 'white' : 'black' 
        }}
      >
        <Typography id="analytics-modal-title" variant="h5" style={{ marginBottom: 20, userSelect: 'none' }}>Server Statistics</Typography>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ marginBottom: 2.5 }}
        >
          <Grid item>
            <Typography><strong>Richest Player:</strong> {data.richestPlayer} - {formatMoney(data.richestPlayerMoney || 0, 'USD')}</Typography>
            <Typography><strong>Average Money Per Player:</strong> {formatMoney(data.averageMoney)}</Typography>
            <Typography><strong>Total Players:</strong> {data.totalPlayers}</Typography>
          </Grid>
          <Grid item>
            <Tooltip title="The full amount of money on the server." arrow placement='top'>
              <Typography><strong>Server Cash Flow:</strong> {formatMoney(data.totalMoney, 'USD')}</Typography>
            </Tooltip>
            <Typography><strong>Richest Player % of Cash Flow:</strong> {(data.richestPlayerMoney / data.totalMoney * 100).toFixed(2)}%</Typography>
          </Grid>
        </Grid>

        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
        >
          <RadarChart cx={250} cy={200} outerRadius={150} width={500} height={400} data={data.jobWealth}>
            <PolarGrid />
            <PolarAngleAxis dataKey="job" />
            <PolarRadiusAxis domain={[0, 50000]} /> {/* dont know why i need a max value tbh.. cus im pretty sure its just taking the richest plyer's money for the max. */}
            <Radar name="Job Wealth" dataKey="averageWealth" stroke={darkMode ? "#8884d8" : "#3976CE"} fill={darkMode ? "#8884d8" : "#3976CE"} fillOpacity={0.6} />
          </RadarChart>

          <BarChart width={400} height={400} data={dataForBarChart} style={{ color: 'black' }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /> 
            <YAxis />
            <RechartsTooltip />
            <Bar dataKey="value" name='Player Wealth' fill={darkMode ? "#8884d8" : "#3976CE"} fillOpacity={0.6} />
          </BarChart>
        </Grid>
      </Box>
    </Modal>
  );
}

function InventoryModal({ inventory, open, handleClose, darkMode, onClose }: { inventory: any[], open: boolean, handleClose: () => void, darkMode: boolean, onClose?: (event: React.SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => void}) {
  const slotSize = 125; // Square size for each slot (125 looks the best in my opinion)
  const inventorySlots = 41; // Max inventory slots (Change this if you have a different max inventory slots)

  const getImageSrc = (itemName: string) => {
    const imagePath = `${process.env.PUBLIC_URL}/images/${itemName}.png`;
    return imagePath;
  };

  return (
    <Modal
      open={open}
      onClose={(event: React.SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => {
        if (onClose) onClose(event, reason);
        handleClose();
      }}
      aria-labelledby="inventory-modal-title"
      aria-describedby="inventory-modal-description"
      sx={{ overflowY: 'scroll' }}
    >
      <Box 
        style={{ 
          width: '80%', 
          margin: '5% auto', 
          backgroundColor: darkMode ? 'rgb(51,51,51,0.8)' : 'rgb(255,255,255,0.8)', 
          padding: '20px', 
          outline: 'none', 
          color: darkMode ? 'white' : 'black' 
        }}
      >
        <Typography id="inventory-modal-title" variant="h5" style={{ marginBottom: 20, userSelect: 'none' }}>Inventory</Typography>
        <Grid container spacing={2} sx={{ marginLeft: 1 }}>
          {[...Array(inventorySlots)].map((_, index) => {
            const item = inventory.find(i => i.slot === index + 1);
            return (
              <Grid item xs={3} key={index} style={{ width: slotSize, height: slotSize, minWidth: slotSize, maxWidth: slotSize, border: '1px solid #3c97e9', padding: '10px', textAlign: 'center', marginRight: 3, marginBottom: 3 }}>
                {item ? <img src={getImageSrc(item.name)} onError={(e) => { e.currentTarget.src = `${process.env.PUBLIC_URL}/images/default.png`; }} alt={item.name} style={{ width: slotSize-20, height: slotSize-20, userSelect: 'none' }} /> : null}
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Modal>
  );
}

function MapModal({ open, handleClose, position, darkMode }: { open: boolean, handleClose: () => void, position: { x: number, y: number, z: number }, darkMode: boolean }) {
  const mapBounds = {
    topLeft: {x: -5700, y: 8400},
    bottomRight: {x: 6600, y: -4000}
  };
  
  const xOffset = 917;
  const yOffset = 1348;

  const xPercentage = (position.x - mapBounds.topLeft.x) / (mapBounds.bottomRight.x - mapBounds.topLeft.x);
  const yPercentage = 1 - (position.y - mapBounds.topLeft.y) / (mapBounds.bottomRight.y - mapBounds.topLeft.y);
  const xPositionOnImage = xPercentage * 1000 + xOffset - 12.5;
  const yPositionOnImage = yPercentage * 1000 + yOffset - 12.5;

  /*console.log(`xPositionOnImage: ${xPositionOnImage}`);
  console.log(`yPositionOnImage: ${yPositionOnImage}`);*/

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="map-modal-title"
      aria-describedby="map-modal-description"
    >
      <Box 
        style={{ 
          width: '80%', 
          margin: '5% auto', 
          backgroundColor: darkMode ? 'rgb(51,51,51,0.8)' : 'rgb(255,255,255,0.8)', 
          padding: '20px', 
          outline: 'none', 
          color: darkMode ? 'white' : 'black' 
        }}
      >
        <Typography id="map-modal-title" variant="h5" style={{ marginBottom: 20, userSelect: 'none' }}>Player Coords: {position.x}, {position.y}, {position.z}</Typography>
        <img src="/map/gtav-map-atlas-huge.jpg" alt="GTA Map" style={{ maxWidth: '80%', maxHeight: '700px', position: 'relative' }}/>
        <img src="/map/marker.png" alt="Marker" style={{ position: 'absolute', left: xOffset, top: yOffset, width: '25px', height: '20px' }} />
        <Typography>Will add a marker at the right place later.. for now this is fine</Typography>
      </Box>
    </Modal>
  );
}

function formatMoney(value: number | bigint, currencyCode = 'USD', isCrypto = false) {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: isCrypto ? 4 : 2,
      maximumFractionDigits: isCrypto ? 4 : 2,
  }).format(value);
}

function VehicleModal({ open, vehicles, handleClose, darkMode, onClose }: VehicleModalProps) {
  const slotSize = 200;
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const convertToPercentage = (value: number) => `${value / 10}%`;

  const handleVehicleClick = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setCustomizationModalOpen(true);
  };

  const closeCustomizationModal = () => {
    setCustomizationModalOpen(false);
    setSelectedVehicle(null);
  };

  console.log(selectedVehicle?.mods);

  return (
    <>
      <Modal
        open={open}
        onClose={(event: React.SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => {
          if (onClose) onClose(event, reason);
          handleClose();
        }}
        aria-labelledby="vehicle-modal-title"
        aria-describedby="vehicle-modal-description"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box 
          style={{
            width: '80%',
            margin: '5% auto',
            backgroundColor: darkMode ? 'rgb(51,51,51,0.8)' : 'rgb(255,255,255,0.8)',
            padding: '20px',
            outline: 'none',
            color: darkMode ? 'white' : 'black'
          }}
        >
          <Typography id="vehicle-modal-title" variant="h5" style={{ marginBottom: 20, userSelect: 'none' }}>Vehicles</Typography>
          <Grid container spacing={2}>
            {vehicles && vehicles.length === 0 && <Typography className="truncate" style={{ marginLeft: 20, marginTop: 5 }}><strong>No vehicles found.</strong></Typography>}
            {vehicles && vehicles.map((vehicle, index) => (
              <ButtonBase 
                focusRipple
                key={index}
                style={{ 
                  width: slotSize, 
                  height: slotSize,
                  display: 'block',
                  textAlign: 'center',
                  marginLeft: 20,
                }}
                onClick={() => handleVehicleClick(vehicle)}
              >
                <Box style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: '1px solid #3c97e9', 
                  padding: '10px', 
                  textAlign: 'center', 
                  marginRight: 3, 
                  marginBottom: 3,
                }}>
                  <Typography className="truncate"><strong>Vehicle:</strong> {vehicle.vehicle}</Typography>
                  <Typography className="truncate"><strong>Plate:</strong> {vehicle.plate}</Typography>
                  <Typography className="truncate"><strong>Garage:</strong> {vehicle.garage}</Typography>
                  <Typography className="truncate"><strong>Fuel:</strong> {vehicle.fuel}%</Typography>
                  <Typography className="truncate"><strong>Engine:</strong> {convertToPercentage(vehicle.engine)}</Typography>
                  <Typography className="truncate"><strong>Body:</strong> {convertToPercentage(vehicle.body)}</Typography>
                  <Tooltip title="Driving Distance" arrow placement='bottom'>
                    <Typography className="truncate"><strong>Distance:</strong> {vehicle.drivingdistance}</Typography>
                  </Tooltip>
                </Box>
              </ButtonBase>
            ))}
          </Grid>
        </Box>
      </Modal>

      <Modal
        open={customizationModalOpen}
        onClose={closeCustomizationModal}
        aria-labelledby="customization-modal-title"
        aria-describedby="customization-modal-description"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box
          style={{
            width: '50%',
            margin: '5% auto',
            backgroundColor: darkMode ? 'rgb(51,51,51,0.9)' : 'rgb(255,255,255,0.9)',
            padding: '20px',
            outline: 'none',
            color: darkMode ? 'white' : 'black'
          }}
        >
          <Typography id="customization-modal-title" variant="h6">Customization for {selectedVehicle?.vehicle}</Typography>
          <Typography id="customization-modal-description" variant="body1">Coming Soon..</Typography>
          <Button onClick={closeCustomizationModal}>Close</Button>
        </Box>
      </Modal>
    </>
  );
}

function PlayerCard({ item, darkMode, onlinePlayers }: { item: DataItem, darkMode: boolean, onlinePlayers: DataItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);

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
  
  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

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

  return (
    <>
      <Paper elevation={3} 
        style={{ 
         padding: expanded ? 30 : 10, 
         marginBottom: 10,
         width: expanded ? '100%' : 'auto',
         height: expanded ? 'auto' : 'auto', 
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
                  <Avatar>{item.name[0]}</Avatar>
                </StyledBadge>
              ) : (
                <Avatar>{item.name[0]}</Avatar>
              )}
              <Typography variant="h6" component="div" onClick={handleTextMouseDown}>{charInfo.firstname} {charInfo.lastname}</Typography>
              <Typography variant="h5" component="div" onClick={handleTextMouseDown}>{item.name}</Typography>
            </Grid>
          {expanded && (
            <>
              <Grid item xs={3}>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Citizen ID:</strong> {item.citizenid}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Char Slot:</strong> {item.cid}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>License:</strong> {item.license}</Typography>
                <Button onClick={handleOpenMap}>Open Map</Button>
                <Button onClick={handleOpenInventory}>Open Inventory</Button>
                <Button onClick={handleOpenVehicle}>Open Vehicles</Button>
              </Grid>
              <Grid item xs={3}>
                <Typography className="truncate" onClick={handleTextMouseDown}>
                    <strong>Cash:</strong> {formatMoney(moneyData.cash, 'USD')}
                </Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}>
                    <strong>Bank:</strong> {formatMoney(moneyData.bank)}
                </Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}>
                    <strong>Crypto:</strong> {formatMoney(moneyData.crypto, 'BTC', true)} {/* BTC is just an example.. */}
                </Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Job:</strong> {jobLabel} - {gradeLabel}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Gang:</strong> {gangLabel} - {gangGradeLabel}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Blood Type:</strong> {metadata.bloodtype}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Callsign:</strong> {metadata.callsign}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Stress:</strong> {metadata.stress}%</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Hunger:</strong> {metadata.hunger.toFixed(2)}%</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Thirst:</strong> {metadata.thirst.toFixed(2)}%</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Driver License:</strong> {metadata.licences.driver ? 'Yes' : 'No'}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Weapon License:</strong> {metadata.licences.weapon ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>First Name:</strong> {charInfo.firstname}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Last Name:</strong> {charInfo.lastname}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Birthdate:</strong> {charInfo.birthdate}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Nationality:</strong> {charInfo.nationality}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Phone:</strong> {charInfo.phone}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Gender:</strong> {charInfo.gender === 0 ? 'Male' : 'Female'}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Backstory:</strong> {charInfo.backstory}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Account:</strong> {charInfo.account}</Typography>
              </Grid>
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

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<DataItem[]>([]);
  const [data, setData] = useState<DataItem[]>([]);
  const [darkMode, setDarkMode] = useState(true); // Now Starts in Dark Mode

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  useEffect(() => {
    // Call our API endpoint and set data
    axios.get<DataItem[]>('http://localhost:3001/getData')
      .then(response => {
        setData(response.data);
        setFilteredData(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching data", error);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/getOnlinePlayers')
      .then(response => {
        console.log("Full Response:", response);
        console.log("Data:", response.data);
        setOnlinePlayers(response.data); // <-- Set the online players here
      })
      .catch(error => {
        console.error("There was an error fetching online players", error);
      });
  }, []);

  useEffect(() => {
    let results = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredData(results);
  }, [searchTerm, data]);

  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    richestPlayer: '',
    richestPlayerMoney: 0,
    totalMoney: 0,
    averageMoney: 0,
    totalPlayers: 0,
    jobWealth: []
  });

  useEffect(() => {
    // If data is populated
    if(data.length > 0) {
        // Find the richest player
        const richestPlayerData = data.reduce((max, player) => {
          const playerTotal = JSON.parse(player.money).cash + JSON.parse(player.money).bank;
          const maxTotal = JSON.parse(max.money).cash + JSON.parse(max.money).bank;
          return playerTotal > maxTotal ? player : max;
        }, data[0]);
  
        // Get name of the richest player from their charinfo
        const charInfoRichest = typeof richestPlayerData.charinfo === 'string' ? JSON.parse(richestPlayerData.charinfo) : richestPlayerData.charinfo;
        const richestPlayerName = `${richestPlayerData.name} / ${charInfoRichest.firstname} ${charInfoRichest.lastname}`;
  
        // Calculate wealth per job
        const jobWealthRaw = getWealthPerJob(data);
        const jobWealth = Object.entries(jobWealthRaw).map(([job, stats]) => {
            return { job, averageWealth: stats.averageWealth };
        });

        // Calculate richest player's total money
        const richestPlayerMoney = JSON.parse(richestPlayerData.money).cash + JSON.parse(richestPlayerData.money).bank;
  
        // Calculate average money
        const totalMoney = data.reduce((sum, player) => sum + JSON.parse(player.money).cash + JSON.parse(player.money).bank, 0);
        const averageMoney = totalMoney / data.length;
  
        // Now set the analytics data
        setAnalyticsData({
          richestPlayer: richestPlayerName,
          richestPlayerMoney: richestPlayerMoney,
          averageMoney: averageMoney,
          totalMoney: totalMoney,
          totalPlayers: data.length,
          jobWealth: jobWealth
        });        
    }
  }, [data]);

  const handleOpenAnalytics = () => {
    setAnalyticsOpen(true);
  };

  const handleCloseAnalytics = () => {
    setAnalyticsOpen(false);
  };

  return (
    <>
      <style>{`
        .truncate {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${darkMode ? '#272727' : '#1976d2'};
        }
  
        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? '#b5b5b5' : '#e0e0e0'};
        }
  
        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? '#555' : '#adadad'};
        }
      `}</style>

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <AppBar position="fixed">
            <Toolbar style={{ display: 'flex' }}>
              <Tooltip title="Change Theme!" placement='right' arrow>
                <IconButton onClick={() => setDarkMode(!darkMode)} edge="start" color="inherit">
                  {darkMode ? <Brightness7 /> : <Brightness4 />}
                </IconButton>
              </Tooltip>
      
              <Box flexGrow={1} />

              <Tooltip title="Server Statistics" placement='left' arrow>
                <IconButton onClick={handleOpenAnalytics} edge="start" color="inherit">
                  <Analytics />
                </IconButton>
              </Tooltip>

              <AnalyticsModal
                open={analyticsOpen}
                handleClose={handleCloseAnalytics}
                data={analyticsData}
                darkMode={darkMode}
              />
            </Toolbar>
          </AppBar>
      
          <div style={{ marginTop: theme.spacing(10) }}>
            <TextField
              variant="standard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for player by steam name..."
              style={{ width: '100%', marginBottom: theme.spacing(2) }}
            />
          </div>

          <Container>
            <div style={{ marginTop: theme.spacing(2) }}>  
              {filteredData.map(item => (
                <PlayerCard key={item.id} item={item} darkMode={darkMode} onlinePlayers={onlinePlayers} />
              ))}
            </div>
          </Container>
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;