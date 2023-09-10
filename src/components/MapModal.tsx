import { Box, Modal, Typography } from "@mui/material";

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

export default MapModal;