import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton, Collapse, Paper } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

interface RowData {
  id: number;
  name: string;
  department: string;
  role: string;
  details: string;
}

export default function MitExpandableDataGrid() {
  // Track expanded rows using an object mapping row ID to a boolean status
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const columns: GridColDef<RowData>[] = [
    {
      field: 'expand',
      headerName: '',
      sortable: false,
      width: 60,
      renderCell: (params) => {
        const isExpanded = !!expandedRows[params.row.id];
        return (
          <IconButton 
            size="small" 
            onClick={() => toggleRowExpansion(params.row.id)}
          >
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        );
      },
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 200,
      renderCell: (params) => {
        const isExpanded = !!expandedRows[params.row.id];
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            {/* The collapsible drawer injection inside the cell block */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>Extended Record Details:</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {params.row.details}
                </Typography>
              </Box>
            </Collapse>
          </Box>
        );
      }
    },
    { field: 'department', headerName: 'Department', width: 150 },
    { field: 'role', headerName: 'Role', width: 150 },
  ];

  const rows: RowData[] = [
    { id: 1, name: 'Alice Smith', department: 'Engineering', role: 'Frontend Lead', details: 'Hired in 2022. Expert in React & UX. Manages a team of 4 engineers.' },
    { id: 2, name: 'Bob Jones', department: 'Product', role: 'Product Manager', details: 'Oversees SaaS integration roadmap. Strong background in data analytics.' },
    { id: 3, name: 'Charlie Brown', department: 'Design', role: 'UI/UX Designer', details: 'Specializes in Design Systems and interactive high-fidelity prototyping.' },
  ];

  // Dynamically scale row heights to prevent overlapping text elements
  const getRowHeight = (params: any) => {
    return expandedRows[params.id] ? 'auto' : 52;
  };

  return (
    <Paper sx={{ height: 400, width: '100%', p: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowHeight={getRowHeight}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.2s ease',
          },
          '& .MuiDataGrid-cell': {
            alignItems: 'flex-start', // Essential for aligned auto-height stacks
            pt: 0.5,
          }
        }}
      />
    </Paper>
  );
}
