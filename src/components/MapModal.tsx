import React, { useEffect, useRef } from 'react';
import { Box, Modal, Typography } from "@mui/material";
import L from 'leaflet';
import GtaMap from './../mapassets/gtav-map-atlas-huge.jpg';
import PlayerMarker from './../mapassets/playermarker.png';

function MapModal({ open, handleClose, position, darkMode }: { open: boolean, handleClose: () => void, position: { x: number, y: number, z: number }, darkMode: boolean }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  let map: L.Map;
  let marker: L.Marker;

  var markerIcon = L.icon({
    iconUrl: PlayerMarker,
    iconSize: [7.68, 10.24],
    iconAnchor: [3.84, 5.12],
    popupAnchor: [0, -5.12]
  });

  const YOffsetCoord = 4350;

  useEffect(() => {
    if (open) {
      const initializeMap = () => {
        if (mapRef.current) {
          map = L.map(mapRef.current, {
            crs: L.CRS.Simple,
            minZoom: -1.5,
            center: [1500, 1500],
          }).setView([position.y-YOffsetCoord, position.x], -1.5);

          const imageUrl = GtaMap;
          const xScale = (6690.999 + 5659.689) / 2000;
          const yScale = (8426.220 + 4058.537) / 2000;

          const leftBound = 0 * xScale - 5659.689;
          const topBound = 0 * yScale - 8426.220;
          const rightBound = 2000 * xScale - 5659.689;
          const bottomBound = 2000 * yScale - 8426.220;

          const imageBounds: L.LatLngBoundsExpression = [
            [topBound, leftBound] as L.LatLngTuple, 
            [bottomBound, rightBound] as L.LatLngTuple
          ];      

          L.imageOverlay(imageUrl, imageBounds).addTo(map);
          marker = L.marker([position.y-YOffsetCoord, position.x], {icon: markerIcon}).addTo(map);
        } else {
          setTimeout(initializeMap, 100);
        }
      };

      initializeMap();
    }

    return () => {
        if (map) {
            map.remove();
        }
    };
  }, [open]);

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
        <Typography id="map-modal-title" variant="h5" style={{ marginBottom: 20/* , userSelect: 'none' */ }}>Player Coords: {position.x}, {position.y}, {position.z}</Typography>
        {open && <div id="map" ref={mapRef} style={{ height: 650, width: '100%' }}></div>}
      </Box>
    </Modal>
  );
}

export default MapModal;
