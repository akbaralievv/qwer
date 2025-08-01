import React from 'react';
import { Icon } from '@iconify/react';

import { Tooltip, IconButton, CircularProgress } from '@mui/material';

// eslint-disable-next-line react/prop-types
export default function RefreshButton({ onClick, loading = false, sx = {}, ...props }) {
  return (
    <Tooltip title="Обновить" arrow>
      <IconButton
        onClick={onClick}
        sx={{
          background: loading ? '#fffde7' : '#ededed',
          color: '#616161',
          borderRadius: 2,
          height: 44,
          width: 44,
          position: 'relative',
          '&:hover': { background: '#e0e0e0', color: '#222' },
          ...sx,
        }}
        {...props}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: '#fbc02d' }} />
        ) : (
          <Icon icon="ic:round-refresh" width={22} height={22} color="#757575" />
        )}
      </IconButton>
    </Tooltip>
  );
}