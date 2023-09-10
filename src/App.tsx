import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, createTheme, IconButton, ThemeProvider, CssBaseline, AppBar, Toolbar, TextField, Tooltip } from '@mui/material';
import { Brightness4, Brightness7, Analytics } from '@mui/icons-material';
import Box from '@mui/material/Box';
import PlayerCard from './components/PlayerCard';
import AnalyticsModal from './components/AnalyticsModal';
import SearchFilters from './components/SearchFilters';
import { getWealthPerJob } from './utils/helpers';
import { UsingPsMdt } from './utils/config';

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
  pfp: string;
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

function App() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredData, setFilteredData] = useState<DataItem[]>([]);
  const [onlinePlayers, setOnlinePlayers] = useState<DataItem[]>([]);
  const [data, setData] = useState<DataItem[]>([]);
  const [darkMode, setDarkMode] = useState(true); // Now Starts in Dark Mode

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      secondary: {
        main: 'rgb(68, 183, 0, 0.4)',
      },
    },
  });

  useEffect(() => {
    // Call our API endpoint and set data
    axios.get<DataItem[]>('http://localhost:3001/getData', {
      params: {
        usingPsMdt: UsingPsMdt
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

          <SearchFilters 
            SearchFilter={SearchFilter}
            setSearchFilter={setSearchFilter}
            darkMode={darkMode}
            theme={theme}
          />

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