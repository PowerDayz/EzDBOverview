import React, { useState } from 'react';
import { Typography, Grid, Paper } from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ItemDisplay from './ItemDisplay';

interface Stash {
  id: number;
  stash: string;
  items: any[];
}

function StashCard({ stash }: { stash: Stash }) {
  const [expanded, setExpanded] = useState(false);

  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
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
          {stash.stash.includes('apartment') ? (
            <ApartmentIcon sx={{ marginTop: .5 }}/>
          ) : (
            <Inventory2Icon sx={{ marginTop: .5 }}/>
          )}

          <Typography variant="h5" component="div" onClick={handleTextMouseDown}>
            {stash.stash}
          </Typography>
        </Grid>
        {expanded && stash.items && JSON.parse(stash.items as unknown as string).map((stashItem: any, index: number) => (
          <Grid
            item
            xs={12}
            sx={{
              marginTop: 2,
              borderTop: 1,
              borderColor: 'divider',
              marginBottom: 2,
            }}
          >
            <ItemDisplay key={index} name={stashItem.name} amount={stashItem.amount} onClick={(e) => e.stopPropagation()} />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default StashCard;
