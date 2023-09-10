import { useState } from "react";
import { Tooltip, Typography, Grid, Modal, Box } from "@mui/material";

interface InventoryItem {
  amount: number;
  type: string;
  slot: number;
  info: any;
  name: string;
  created: number;
}

function InventoryModal({ inventory, open, handleClose, darkMode, onClose }: { inventory: InventoryItem[], open: boolean, handleClose: () => void, darkMode: boolean, onClose?: (event: React.SyntheticEvent, reason: "backdropClick" | "escapeKeyDown") => void}) {
  const slotSize = 125; // Square size for each slot (125 looks the best in my opinion)
  const inventorySlots = 41; // Max inventory slots (Change this if you have a different max inventory slots)

  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const getImageSrc = (itemName: string) => {
    const imagePath = `${process.env.PUBLIC_URL}/images/${itemName}.png`;
    return imagePath;
  };

  const copyToClipboard = (itemName: string) => {
    navigator.clipboard.writeText(itemName).then(() => {
      setCopiedItem(itemName);
      setTimeout(() => setCopiedItem(null), 2000); // Reset after 2 seconds
    });
  };

  const inventoryArray = Array.isArray(inventory) ? inventory.filter(item => item !== null) : [];

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
            const item = inventoryArray.find(i => i.slot === index + 1);
            return (
              <Grid item xs={3} key={index} style={{ width: slotSize, height: slotSize+45, minWidth: slotSize, maxWidth: slotSize, border: '1px solid #3c97e9', padding: '10px', marginRight: 3, marginBottom: 3 }}>
                {item && (
                  <Tooltip title={copiedItem === item.name ? "Copied!" : "Click to copy name"} placement='top' arrow>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }} onClick={() => copyToClipboard(item.name)}>
                      <Typography variant="body1" style={{ userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: slotSize-20, marginBottom: 4 }}>{item.amount}</Typography>
                      <img src={getImageSrc(item.name)} onError={(e) => { e.currentTarget.src = `${process.env.PUBLIC_URL}/images/default.png`; }} alt={item.name} style={{ width: slotSize-20, height: slotSize-20, userSelect: 'none', marginBottom: 4 }} />
                      <Typography variant="body1" style={{ userSelect: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: slotSize-20 }}>{item.name}</Typography>
                    </div>
                  </Tooltip>
                )}
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Modal>
  );
}

export default InventoryModal;