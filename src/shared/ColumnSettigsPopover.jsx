/* eslint-disable react/prop-types */
import React from 'react';

import {
  Box, Divider, Tooltip, Popover, Checkbox, FormGroup, Typography,
  FormControlLabel
} from '@mui/material';

export default function ColumnSettingsPopover({
  open,
  anchorEl,
  onClose,
  columns,
  visibleColumns,
  onColumnChange,
  rememberColumns,
  onRememberColumnsChange, // <-- новый проп
}) {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Box p={2} minWidth={220}>
        <Typography fontWeight={600} mb={1} fontSize={16}>Настройки колонок</Typography>
        <FormGroup>
          {columns.map((col) => (
            <FormControlLabel
              key={col.key}
              control={
                <Checkbox
                  checked={visibleColumns.includes(col.key)}
                  onChange={() => onColumnChange(col.key)}
                  color="primary"
                  disabled={col.always}
                />
              }
              label={col.label}
            />
          ))}
        </FormGroup>
        <Divider sx={{ my: 1 }} />
        <Tooltip title="Запомнить текущую настройку" arrow>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'flex-end',
              borderRadius: 1,
            }}
          >
            <FormControlLabel
              label={
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: 15,
                    userSelect: 'none',
                  }}
                >
                  Запомнить
                </Typography>
              }
              labelPlacement="start"
              control={
                <Checkbox
                  checked={rememberColumns}
                  onChange={e => onRememberColumnsChange(e.target.checked)}
                  color="primary"
                  sx={{
                    '& .MuiSvgIcon-root': { fontSize: 24 },
                  }}
                />
              }
              sx={{
                marginLeft: 0,
                marginRight: 0,
              }}
            />
          </Box>
        </Tooltip>
      </Box>
    </Popover>
  );
}