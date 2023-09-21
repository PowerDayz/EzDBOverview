import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, createTheme, IconButton, ThemeProvider, CssBaseline, AppBar, Toolbar, TextField, Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, Button, DialogActions, Menu, MenuItem, Typography, List, ListItem, ListItemText, FormControl, InputLabel, Select, Grid, Snackbar, Alert, Skeleton } from '@mui/material';
import { Brightness4, Brightness7, Analytics } from '@mui/icons-material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupsIcon from '@mui/icons-material/Groups';
import Box from '@mui/material/Box';
import PlayerCard from './components/PlayerCard';
import AnalyticsModal from './components/AnalyticsModal';
import SearchFilters from './components/SearchFilters';
import { getWealthPerJob } from './utils/helpers';
import { UsingPsHousing, UsingPsMdt } from './utils/config';
import InventoryModal from './components/InventoryModal';

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

interface AdminUsernames {
  username: string;
  role: string;
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
  jobCount: {
    job: string;
    count: number;
  }[];
  totalCars: number;
};

interface AppProps {
  loggedInUser: { username: string, rank: string } | null;
  setLoggedInUser: (user: { username: string, rank: string } | null) => void;
  darkMode: boolean;
  setDarkMode?: (mode: boolean) => void;
}

function PlayerCardSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <Box sx={{ backgroundColor: darkMode? '#242424' : '#EBEBEB', padding: 1.5, marginBottom: 1.3, borderRadius: 1 }}>
      <Grid item container justifyContent="space-between">
        <Skeleton variant="circular" width={40} height={40}/>
        <Skeleton variant="text" sx={{ fontSize: '2rem', width: 150, marginLeft: 5 }} />
        <Skeleton variant="text" sx={{ fontSize: '2rem', width: 100 }} />
      </Grid>
    </Box>
  );
}

function AdminManageSkeleton() {
  return (
    <Grid item container justifyContent="space-between">
      <Skeleton variant='text' sx={{ marginTop: 1, width: 50 }} />
      <Skeleton variant='text' sx={{ marginTop: 1, width: 100 }} />
    </Grid>
  )
}

function App({ loggedInUser, setLoggedInUser, darkMode, setDarkMode }: AppProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<PlayerDataItem[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<PlayerDataItem[]>([]);
  const [adminUserNames, setadminUserNames] = useState<AdminUsernames[]>([]);
  const [data, setData] = useState<PlayerDataItem[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      secondary: {
        main: 'rgb(68, 183, 0, 0.4)',
      },
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      localStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    } else {
      localStorage.removeItem('loggedInUser');
    }
  }, [loggedInUser]);

  
  useEffect(() => {
    // Call our API endpoint and set data
    axios.get<PlayerDataItem[]>('http://localhost:3001/getData', { // If you're running this on a server change this to the server's IP address
      params: {
        usingPsMdt: UsingPsMdt,
        usingPsHousing: UsingPsHousing
      }
    })
    .then(response => {
      setData(response.data);
      setFilteredData(response.data);
    })
    .catch(error => {
      console.error("There was an error fetching data", error);
    });
  }, []);

  useEffect(() => {
    if (loggedInUser?.rank === 'God') {
      fetchAdminUsernames();
    }
  }, [loggedInUser?.rank]);

  useEffect(() => {
    axios.get('http://localhost:3001/getOnlinePlayers') // If you're running this on a server change this to the server's IP address
      .then(response => {
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
    jobWealth: [],
    jobCount: [],
    totalCars: 0
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
  
      // Calculate job counts
      const jobCounts = data.reduce<{ [key: string]: number }>((acc, player) => {
        const jobData = typeof player.job === 'string' ? JSON.parse(player.job) : player.job;
        const jobName = jobData.name;

        if (!acc[jobName]) {
          acc[jobName] = 0;
        }

        acc[jobName]++;

        return acc;
      }, {});

      const jobCountArray = Object.entries(jobCounts).map(([job, count]) => {
        return { job, count: count as number };  // Ensure that count is treated as a number
      });

      const totalCars = data.reduce((count, player) => count + player.vehicles.length, 0);

      // Now set the analytics data
      setAnalyticsData({
        richestPlayer: richestPlayerName,
        richestPlayerMoney: richestPlayerMoney,
        averageMoney: averageMoney,
        totalMoney: totalMoney,
        totalPlayers: data.length,
        jobWealth: jobWealth,
        jobCount: jobCountArray,
        totalCars: totalCars
      });        
    }
  }, [data]);

  const handleOpenAnalytics = () => {
    setAnalyticsOpen(true);
  };

  const handleCloseAnalytics = () => {
    setAnalyticsOpen(false);
  };

  const [converterOpen, setConverterOpen] = useState(false);
  const [pastedInventory, setPastedInventory] = useState<string | null>(null);
  const [convertedInventoryOpen, setConvertedInventoryOpen] = useState(false);
  const [converterError, setConverterError] = useState<string | null>(null);
  const [rawInput, setRawInput] = useState<string>('');

  const handleConverterSubmit = () => {
    if (rawInput.includes("[object Object]")) {
      console.error("Invalid input detected:", rawInput);
      setConverterError("Invalid input detected. Please provide valid JSON.");
      return;
    }

    try {
      const parsedInventory = JSON.parse(rawInput);
      setPastedInventory(parsedInventory);
      setConverterOpen(false);
      setConvertedInventoryOpen(true);
      setConverterError(null);
      setRawInput('');
    } catch (error) {
      console.error("Failed to parse the pasted inventory", error);
      setConverterError("Failed to parse the pasted inventory. Please ensure it's valid JSON.");
    }
  };

  const handleRawInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRawInput(event.target.value);
  };

  const handleCloseConverter = () => {
    setConverterOpen(false);
    setRawInput('');
    setConverterError(null);
  };

  const [SearchFilter, setSearchFilter] = useState<{ online?: boolean, job?: string }>({});

  useEffect(() => {
    let results = data;

    // If the online player filter is active
    if (SearchFilter.online) {
        results = results.filter(item => onlinePlayers.some(player => player.citizenid === item.citizenid));
    }

    // If a job filter is selected
    if (SearchFilter.job) {
      results = results.filter(item => {
        const jobData = typeof item.job === 'string' ? JSON.parse(item.job) : item.job;
        return jobData.name === SearchFilter.job;
      });
    }

    // Filter by search term
    results = results.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    setFilteredData(results);
  }, [searchTerm, data, SearchFilter, onlinePlayers]);

  const parsedInventory = typeof pastedInventory === 'string' ? JSON.parse(pastedInventory) : pastedInventory;

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    window.location.reload();
  };

  const handleDarkModeToggle = () => {
    const toggleFunction = setDarkMode || (() => {});
    toggleFunction(!darkMode);
  }

  const [isManageStaffModalOpen, setIsManageStaffModalOpen] = useState(false);
  const [stagedAdminRoles, setStagedAdminRoles] = useState<Record<string, string>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSnackbarMessage('');
  };

  const fetchAdminUsernames = () => {
    axios.get('http://localhost:3001/getAdminUsernames') // If you're running this on a server change this to the server's IP address
      .then(response => {
        setadminUserNames(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching admin usernames", error);
      });
  };

  const handleRoleChange = (username: string, newRole: string) => {
    setStagedAdminRoles(prevState => ({ ...prevState, [username]: newRole }));
  };

  const deleteAdmin = (username: string) => {
    axios.delete(`http://localhost:3001/admin/${username}`) // If you're running this on a server change this to the server's IP address
      .then(response => {
        setSnackbarMessage('Admin deleted successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        fetchAdminUsernames();
      })
      .catch(error => {
        console.error("There was an error deleting the admin", error);
        setSnackbarMessage('Error deleting the admin.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  }

  const handleSaveChanges = () => {
    axios.put('http://localhost:3001/admin', stagedAdminRoles) // If you're running this on a server change this to the server's IP address
      .then(response => {
        setSnackbarMessage('Roles updated successfully.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setIsManageStaffModalOpen(false);
        setStagedAdminRoles({});
        fetchAdminUsernames();
      })
      .catch(error => {
        console.error("There was an error updating the roles", error);
        setSnackbarMessage('Error updating the roles.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
  }

  const clearToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');

    window.location.reload();
  }
  // console.log(loggedInUser); // If the page is just loading blank check this to see if the token is being set properly

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
          {loggedInUser === null && (
            <Dialog open={true}>
              <DialogTitle>Error 404</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Your token was not found.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Grid
                  container
                  direction="row-reverse"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button onClick={clearToken}>Clear Token</Button>
                </Grid>
              </DialogActions>
            </Dialog>
          )}
        
          {
            loggedInUser?.rank === 'User' && (
              <>
                <AppBar position="fixed">
                  <Toolbar style={{ display: 'flex' }}>
                    <Tooltip title="User Menu" placement='bottom' arrow sx={{ marginRight: 3 }}>
                      <IconButton onClick={handleMenuOpen} edge="start" color="inherit">
                        <AccountBoxIcon />
                      </IconButton>
                    </Tooltip>
              
                    <Tooltip title="Change Theme!" placement='bottom' arrow>
                      <IconButton onClick={() => handleDarkModeToggle()} edge="start" color="inherit">
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                      </IconButton>
                    </Tooltip>
                  </Toolbar>
                </AppBar>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>{"Username: " + loggedInUser?.username || 'Error 404'}</MenuItem>
                  <MenuItem disabled>{"Rank: " + loggedInUser?.rank || 'Error 404'}</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>

                <div style={{ marginTop: theme.spacing(10) }}>
                  <Typography variant='h5' gutterBottom>
                    You are not authorized to view this page. Please contact an administrator if you believe this is a mistake.
                  </Typography>
                </div>
              </>
            )}
            { (loggedInUser?.rank === 'Admin' || loggedInUser?.rank === 'God') && (
              <>
                <AppBar position="fixed">
                  <Toolbar style={{ display: 'flex' }}>
                    <Tooltip title="User Menu" placement='bottom' arrow sx={{ marginRight: 3 }}>
                      <IconButton onClick={handleMenuOpen} edge="start" color="inherit">
                        <AccountBoxIcon />
                      </IconButton>
                    </Tooltip>

                    {loggedInUser?.rank === 'God' && (
                      <Tooltip title="Manage Staff" placement='bottom' arrow sx={{ marginRight: 3 }}>
                        <IconButton onClick={() => setIsManageStaffModalOpen(true)} edge="start" color="inherit">
                          <GroupsIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Change Theme!" placement='bottom' arrow>
                      <IconButton onClick={() => handleDarkModeToggle()} edge="start" color="inherit">
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                      </IconButton>
                    </Tooltip>

                    <Box flexGrow={1} />

                    <Tooltip title="Inventory Log Converter" placement='bottom' arrow sx={{ marginRight: 3 }}>
                      <IconButton onClick={() => setConverterOpen(true)} edge="start" color="inherit">
                        <InventoryIcon />
                      </IconButton>
                    </Tooltip>

                    <InventoryModal
                      inventory={parsedInventory}
                      open={convertedInventoryOpen}
                      handleClose={() => setConvertedInventoryOpen(false)}
                      darkMode={darkMode}
                      onClose={(event: React.SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => {
                        if (reason === "backdropClick") {
                          event.stopPropagation();
                        }
                      }}
                    />

                    <Tooltip title="Server Statistics" placement='bottom' arrow>
                      <IconButton onClick={handleOpenAnalytics} edge="start" color="inherit">
                        <Analytics />
                      </IconButton>
                    </Tooltip>
                    
                    <AnalyticsModal
                      open={analyticsOpen}
                      handleClose={handleCloseAnalytics}
                      data={analyticsData}
                      darkMode={darkMode}
                      theme={theme}
                    />
                  </Toolbar>
                </AppBar>

                <Dialog open={isManageStaffModalOpen} onClose={() => setIsManageStaffModalOpen(false)}>
                  <DialogTitle>Manage Staff</DialogTitle>
                  <DialogContent>
                    <List>
                      {adminUserNames.map(admin => (
                        <ListItem key={admin.username}>
                          <Grid
                            container
                            direction="row"
                            justifyContent="flex-start"
                            alignItems="center"
                          >
                            {loggedInUser?.username !== admin.username ? (
                              <>
                              <Tooltip title="Delete User (Cannot be reverted!)" placement='bottom' arrow sx={{ marginRight: 1, marginTop: 1.5 }}>
                                <IconButton edge="start" color="inherit" onClick={() => deleteAdmin(admin.username)}>
                                  <DeleteForeverIcon />
                                </IconButton>
                              </Tooltip>
                              <ListItemText primary={admin.username+":"} sx={{ marginRight: 3, marginTop: 2 }} />
                              </>
                            ) : (
                              <ListItemText primary={admin.username+":"} sx={{ paddingLeft: 4.25, marginTop: 2 }} /> /* idfk whats going on here tbh but it works lmao */
                            )}

                          </Grid>
                          <FormControl variant="standard" sx={{ minWidth: 200 }}>
                            <InputLabel>Role</InputLabel>
                            <Select
                              value={stagedAdminRoles[admin.username] || admin.role}
                              onChange={event => handleRoleChange(admin.username, event.target.value as string)}
                              label="Role"
                            >
                              <MenuItem value="User">User</MenuItem>
                              <MenuItem value="Admin">Admin</MenuItem>
                              <MenuItem value="God">God</MenuItem>
                            </Select>
                          </FormControl>
                        </ListItem>
                      ))}
                      {adminUserNames.length === 0 && (
                        Array.from({ length: 5 }).map((_, index) => <AdminManageSkeleton key={index} />)
                      )}
                    </List>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setIsManageStaffModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveChanges} color="primary">Save Changes</Button>
                  </DialogActions>
                </Dialog>

                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                  <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                  </Alert>
                </Snackbar>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem disabled>{"Username: " + loggedInUser?.username || 'Error 404'}</MenuItem>
                  <MenuItem disabled>{"Rank: " + loggedInUser?.rank || 'Error 404'}</MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>

                <div style={{ marginTop: theme.spacing(10) }}>
                  <TextField
                    variant="standard"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for player by steam name..."
                    style={{ width: '100%', marginBottom: theme.spacing(2) }}
                  />
                </div>

                <SearchFilters 
                  SearchFilter={SearchFilter}
                  setSearchFilter={setSearchFilter}
                  darkMode={darkMode}
                  theme={theme}
                />

                <Dialog open={converterOpen} onClose={handleCloseConverter}>
                  <DialogTitle>Inventory Log Converter</DialogTitle>
                  <DialogContent>
                    <DialogContentText sx={{ marginBottom: 2 }}>
                      Please paste your inventory log below. With out without the Playername, CitizenID, id and items set:
                    </DialogContentText>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="name"
                      label="Inventory Log"
                      type="text"
                      fullWidth
                      value={rawInput}
                      onChange={handleRawInputChange}
                    />

                    {converterError && <div style={{ color: 'red', marginTop: '10px' }}>{converterError}</div>} {/* Display error here */}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleCloseConverter} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={handleConverterSubmit} color="primary">
                      Submit
                    </Button>
                  </DialogActions>
                </Dialog>

                <Container>
                  <div style={{ marginTop: theme.spacing(2) }}>
                    {filteredData.length === 0 ? (
                      Array.from({ length: 5 }).map((_, index) => <PlayerCardSkeleton key={index} darkMode={darkMode} />)
                    ) : (
                      filteredData.map((item, index) => (
                        <PlayerCard key={item.id || index} item={item} darkMode={darkMode} onlinePlayers={onlinePlayers} house_coords={item.house_coords || []} />
                      ))
                    )}
                  </div>
                </Container>
              </>
            )
          }
        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;