import { Box, Button, ButtonBase, Grid, Modal, Tooltip, Typography } from "@mui/material";
import { useState } from "react";

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

export default VehicleModal;