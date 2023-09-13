import { Box, Chip, Grid, Modal, Tooltip, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, XAxis, YAxis } from "recharts";
import { Tooltip as RechartsTooltip } from 'recharts';
import { formatMoney } from "../utils/helpers";

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

function AnalyticsModal({ open, handleClose, data, darkMode, theme }: { open: boolean, handleClose: () => void, data: AnalyticsData, darkMode: boolean, theme: any }) {
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
            <Typography><strong>Total Owned Vehicles:</strong> {data.totalCars}</Typography>
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

        <Grid
          container
          direction="row"
          justifyContent="space-evenly"
          alignItems="center"
          spacing={2}
          sx={{ marginTop: 1.5 }}
        >
          {data.jobCount.map((jobData) => (
            <Grid item key={jobData.job}>
              <Chip 
                label={`${jobData.job}: (${jobData.count})`}  
                sx={{ 
                  color: darkMode ? '#fff' : '#000', 
                  userSelect: 'none', 
                  backgroundColor: darkMode ? "rgb(136, 132, 216, 0.6)" : "rgb(57, 118, 206, 0.6)", 
                  fillOpacity: 0.6 
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Modal>
  );
}

export default AnalyticsModal;