import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { Container, Grid, Paper, Typography, Avatar, createTheme, IconButton, ThemeProvider, CssBaseline, AppBar, Toolbar, Button, TextField } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
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
}

function InventoryModal({ inventory, open, handleClose, darkMode }: { inventory: any[], open: boolean, handleClose: () => void, darkMode: boolean }) {
  const slotSize = 125; // Square size for each slot (125 looks the best in my opinion)
  const inventorySlots = 41; // Max inventory slots (Change this if you have a different max inventory slots)

  const getImageSrc = (itemName: string) => {
    const imagePath = `${process.env.PUBLIC_URL}/images/${itemName}.png`;
    return imagePath;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="inventory-modal-title"
      aria-describedby="inventory-modal-description"
    >
      <Box 
        style={{ 
          width: '80%', 
          margin: '5% auto', 
          backgroundColor: darkMode ? '#333' : 'white', 
          padding: '20px', 
          outline: 'none', 
          color: darkMode ? 'white' : 'black' 
        }}
      >
        <Typography id="inventory-modal-title" variant="h5" style={{ marginBottom: 20, userSelect: 'none' }}>Inventory</Typography>
        <Grid container spacing={2}>
          {[...Array(inventorySlots)].map((_, index) => {
            const item = inventory.find(i => i.slot === index + 1);
            return (
              <Grid item xs={3} key={index} style={{ width: slotSize, height: slotSize, minWidth: slotSize, maxWidth: slotSize, border: '1px solid #232A36', padding: '10px', textAlign: 'center' }}>
                {item ? <img src={getImageSrc(item.name)} onError={(e) => { e.currentTarget.src = `${process.env.PUBLIC_URL}/images/default.png`; }} alt={item.name} style={{ width: slotSize-20, height: slotSize-20, userSelect: 'none' }} /> : null}
              </Grid>
            );
          })}
        </Grid>
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

function PlayerCard({ item, darkMode }: { item: DataItem, darkMode: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);

  const handleOpenInventory = () => {
    setInventoryOpen(true);
  };

  const handleCloseInventory = () => {
    setInventoryOpen(false);
  };

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
              <Avatar>{item.name[0]}</Avatar>
              <Typography variant="h5" component="div">{item.name}</Typography>
            </Grid>
          {expanded && (
            <>
              <Grid item xs={3}>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Citizen ID:</strong> {item.citizenid}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>CID:</strong> {item.cid}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>License:</strong> {item.license}</Typography>
                <Typography className="truncate" onClick={handleTextMouseDown}><strong>Position:</strong> {item.position}</Typography>
                <Button onClick={handleOpenInventory}>Open Inventory</Button>
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
      />
    </>
  );
}

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
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
        console.log(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching data", error);
      });
  }, []);

  useEffect(() => {
    let results = data.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredData(results);
  }, [searchTerm, data]);

  const richestPlayer = data.reduce((acc, curr) => {
    if(!acc) return curr;
    const accTotal = JSON.parse(acc.money).cash + JSON.parse(acc.money).bank;
    const currTotal = JSON.parse(curr.money).cash + JSON.parse(curr.money).bank;
    return accTotal > currTotal ? acc : curr;
  }, data[0] || {});
  const charInfoRichestPlayer = typeof richestPlayer.charinfo === 'string' ? JSON.parse(richestPlayer.charinfo) : richestPlayer.charinfo;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <AppBar position="fixed">
          <Toolbar style={{ display: 'flex' }}>
            <IconButton onClick={() => setDarkMode(!darkMode)} edge="start" color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
  
            <Box flexGrow={1} />
  
            {richestPlayer && charInfoRichestPlayer && (
              <>
                <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}><strong>Richest Player:</strong></Typography>
                <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}>{`${richestPlayer.name} / ${charInfoRichestPlayer.firstname} ${charInfoRichestPlayer.lastname}`}</Typography>
                <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}><strong>Cash: </strong>{formatMoney(JSON.parse(richestPlayer.money).cash, 'USD')}</Typography>
                <Typography variant="h6" style={{ marginLeft: theme.spacing(1) }}><strong>Bank: </strong>{formatMoney(JSON.parse(richestPlayer.money).bank, 'USD')}</Typography>
              </>
            )}
          </Toolbar>
        </AppBar>
  
        <div style={{ marginTop: theme.spacing(10) }}>
          <TextField
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for player by name..."
            style={{ width: '100%', marginBottom: theme.spacing(2) }}
          />
        </div>
  
        <Container>
          <div style={{ marginTop: theme.spacing(2) }}>  
            {filteredData.map(item => (
              <PlayerCard key={item.id} item={item} darkMode={darkMode} />
            ))}
          </div>
        </Container>
      </Container>
    </ThemeProvider>
  );
}

export default App;
