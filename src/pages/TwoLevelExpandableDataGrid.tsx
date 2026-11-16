import React, { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, IconButton, Collapse, Paper, Divider } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface SubProject {
  id: string;
  title: string;
  deepDiveNotes: string;
}

interface RowData {
  id: number;
  name: string;
  department: string;
  role: string;
  details: string;
  subProjects: SubProject[];
}

export default function TwoLevelExpandableDataGrid() {
  // Level 1 expansion state: tracks row IDs
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  
  // Level 2 expansion state: tracks sub-item keys formatted as "rowId-subProjectId"
  const [expandedSubRows, setExpandedSubRows] = useState<Record<string, boolean>>({});

  const toggleRowExpansion = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSubRowExpansion = (rowId: number, subId: string) => {
    const key = `${rowId}-${subId}`;
    setExpandedSubRows((prev) => ({
      ...prev,
      [key]: !prev[key],
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
            aria-label="expand row"
          >
            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        );
      },
    },
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 240,
      renderCell: (params) => {
        const isExpanded = !!expandedRows[params.row.id];
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 1 }}>
            <Typography variant="body2" fontWeight="bold">
              {params.value}
            </Typography>
            
            {/* Level 1 Collapse Container */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ mt: 1, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, width: '100%' }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>Level 1: General Background</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {params.row.details}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  <strong>Assigned Projects (Level 2):</strong>
                </Typography>

                {/* Level 2 Sub-Items List */}
                {params.row.subProjects.map((sub) => {
                  const subKey = `${params.row.id}-${sub.id}`;
                  const isSubExpanded = !!expandedSubRows[subKey];

                  return (
                    <Box key={sub.id} sx={{ mb: 1, pl: 1, borderLeft: '2px solid', borderColor: 'primary.main' }}>
                      <Box 
                        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', py: 0.5 }}
                        onClick={() => toggleSubRowExpansion(params.row.id, sub.id)}
                      >
                        <IconButton size="small" sx={{ p: 0.5, mr: 0.5 }}>
                          {isSubExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                        </IconButton>
                        <Typography variant="body2" fontWeight="medium">
                          {sub.title}
                        </Typography>
                      </Box>

                      {/* Level 2 Collapse Container */}
                      <Collapse in={isSubExpanded} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: 4, py: 1, pr: 1, bgcolor: 'background.paper', borderRadius: 1, mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            <strong>Level 2 Deep Dive:</strong>
                          </Typography>
                          <Typography variant="caption" color="text.primary">
                            {sub.deepDiveNotes}
                          </Typography>
                        </Box>
                      </Collapse>
                    </Box>
                  );
                })}
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
    { 
      id: 1, 
      name: 'Alice Smith', 
      department: 'Engineering', 
      role: 'Frontend Lead', 
      details: 'Hired in 2022. Expert in React & UX. Manages a team of 4 engineers.',
      subProjects: [
        { id: 'p1', title: 'Design System Overhaul', deepDiveNotes: 'Migrating legacy components to MUI v6. 70% complete.' },
        { id: 'p2', title: 'Performance Optimization', deepDiveNotes: 'Reducing initial bundle size and optimizing re-renders.' }
      ]
    },
    { 
      id: 2, 
      name: 'Bob Jones', 
      department: 'Product', 
      role: 'Product Manager', 
      details: 'Oversees SaaS integration roadmap. Strong background in data analytics.',
      subProjects: [
        { id: 'p3', title: 'Enterprise SSO Integration', deepDiveNotes: 'Coordinating with Okta and Azure AD engineering squads.' }
      ]
    },
    { 
      id: 3, 
      name: 'Charlie Brown', 
      department: 'Design', 
      role: 'UI/UX Designer', 
      details: 'Specializes in Design Systems and interactive high-fidelity prototyping.',
      subProjects: [
        { id: 'p4', title: 'Dark Mode Redesign', deepDiveNotes: 'Establishing accessible contrast tokens across all themes.' },
        { id: 'p5', title: 'Mobile App Wireframes', deepDiveNotes: 'Creating user flows for iOS and Android releases.' }
      ]
    },
  ];

  // Dynamically scale row heights based on whether Level 1 or Level 2 are open
  const getRowHeight = (params: any) => {
    if (!expandedRows[params.id]) return 52;
    // Return 'auto' to allow MUI to calculate combined height of Level 1 and active Level 2 collapses
    return 'auto';
  };

  return (
    <Paper sx={{ height: 500, width: '100%', p: 2 }}>
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
