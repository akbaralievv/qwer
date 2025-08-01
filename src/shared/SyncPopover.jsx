/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prop-types */
import React from 'react';

import { Box, Button, Popover, Typography, CircularProgress } from '@mui/material';

export default function SyncPopover({
  open,
  anchorEl,
  onClose,
  syncFrom,
  syncTo,
  onChange,
  onSync,
  isSyncing,
  maxDate
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box p={2} minWidth={260}>
        <Typography fontWeight={600} mb={1} fontSize={16}>Синхронизировать за период:</Typography>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <label>
            <span style={{ marginRight: 8 }}>С</span>
            <input
              type="date"
              name="syncFrom"
              value={syncFrom}
              max={syncTo}
              onChange={onChange}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
          <label>
            <span style={{ margin: '0 8px' }}>по</span>
            <input
              type="date"
              name="syncTo"
              value={syncTo}
              min={syncFrom}
              max={maxDate}
              onChange={onChange}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
            />
          </label>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={onSync}
          sx={{ width: '100%' }}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            'Синхронизировать'
          )}
        </Button>
      </Box>
    </Popover>
  );
}