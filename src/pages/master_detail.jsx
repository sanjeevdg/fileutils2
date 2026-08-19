import React, { useState, useEffect } from 'react';
import { Box, List, ListItemButton, ListItemText, Paper, Typography, Divider, Stack } from '@mui/material';

export default function MasterDetail() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detailData, setDetailData] = useState(null);

  // 1. Fetch master list once
  useEffect(() => {
    fetch('/api/products').then(res => res.json()).then(data => {
      setItems(data);
      if(data.length > 0) setSelectedId(data[0].id); // Auto-select first item
    });
  }, []);

  // 2. Fetch details whenever selection changes
  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/products/${selectedId}`).then(res => res.json()).then(data => {
      setDetailData(data);
    });
  }, [selectedId]);

  return (
    <Box sx={{ display: 'flex', height: '80vh', border: '1px solid #e00', borderRadius: 2, overflow: 'hidden' }}>
      
      {/* MASTER PANEL */}
      <Box sx={{ width: '30%', borderRight: '1px solid #ddd', overflowY: 'auto', bgcolor: 'background.paper' }}>
        <List component="nav">
          {items.map((item) => (
            <ListItemButton 
              key={item.id} 
              selected={selectedId === item.id}
              onClick={() => setSelectedId(item.id)}
            >
              <ListItemText primary={item.name} secondary={item.category} />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* DETAIL PANEL */}
      <Box sx={{ width: '70%', p: 3, overflowY: 'auto', bgcolor: '#f9f9f9' }}>
        {detailData ? (
          <Paper elevation={0} sx={{ p: 3, bgcolor: 'transparent' }}>
            <Typography variant="h4" gutterBottom>{detailData.name}</Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Typography variant="subtitle1"><strong>SKU:</strong> {detailData.sku}</Typography>
              <Typography variant="body1">{detailData.description}</Typography>
              <Typography variant="h6" color="primary">Price: {detailData.price}</Typography>
            </Stack>
          </Paper>
        ) : (
          <Typography variant="body1">Select an item from the left to view details.</Typography>
        )}
      </Box>

    </Box>
  );
}
