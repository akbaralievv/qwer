/* eslint-disable no-unused-expressions */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';

import { Box, Button, Tooltip, Popover, Checkbox, Typography, FormControlLabel } from '@mui/material';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(`${dateStr}T00:00:00+06:00`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function PeriodPicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
  storageKey = 'payment_date_filter',
}) {
  const STORAGE_KEY = storageKey;

  const [anchorEl, setAnchorEl] = useState(null);
  const [remember, setRemember] = useState(() => !!localStorage.getItem(STORAGE_KEY));
  const [draftPeriod, setDraftPeriod] = useState(() => {
    if (remember) {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return {
          periodFrom: saved?.periodFrom || value.periodFrom,
          periodTo: saved?.periodTo || value.periodTo,
        };
      } catch {
        return value;
      }
    }
    return value;
  });

  useEffect(() => {
    setDraftPeriod(value);
  }, [value, value.periodFrom, value.periodTo]);

  useEffect(() => {
    if (remember) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftPeriod));
    }
  }, [draftPeriod, remember, STORAGE_KEY]);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleDraftChange = (name, val) => {
    setDraftPeriod(prev => ({ ...prev, [name]: val }));
  };

  const handleRememberChange = (checked) => {
    setRemember(checked);
    if (!checked) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftPeriod));
    }
  };

  const handleApply = () => {
    onChange && onChange(draftPeriod);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Период" arrow>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            background: '#ededed',
            borderRadius: 2,
            px: 2,
            py: 1,
            minHeight: 44,
            gap: 1.5,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            '&:hover': { background: '#e0e0e0' },
            fontSize: 15,
          }}
          onClick={disabled ? undefined : handleOpen}
        >
          <Icon icon="ic:round-date-range" width={22} height={22} color="#616161" />
          <Typography variant="body2" sx={{ color: '#444', fontWeight: 500 }}>
            {formatDate(draftPeriod.periodFrom)} — {formatDate(draftPeriod.periodTo)}
          </Typography>
        </Box>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box p={2} display="flex" flexDirection="column" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <label htmlFor="periodFrom-input">
              <span style={{ marginRight: 8 }}>С</span>
            </label>
            <input
              id="periodFrom-input"
              type="date"
              name="periodFrom"
              value={draftPeriod.periodFrom}
              max={draftPeriod.periodTo}
              min={minDate}
              onChange={e => handleDraftChange('periodFrom', e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
              disabled={disabled}
            />
            <label htmlFor="periodTo-input">
              <span style={{ margin: '0 8px' }}>по</span>
            </label>
            <input
              id="periodTo-input"
              type="date"
              name="periodTo"
              value={draftPeriod.periodTo}
              min={draftPeriod.periodFrom}
              max={maxDate}
              onChange={e => handleDraftChange('periodTo', e.target.value)}
              style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}
              disabled={disabled}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row-reverse',
              justifyContent: 'flex-end',
              alignItems: 'center',
              borderRadius: 1,
            }}
          >
            <Tooltip title="Запомнить выбранный период" arrow>
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
                    checked={remember}
                    onChange={e => handleRememberChange(e.target.checked)}
                    color="primary"
                    sx={{
                      '& .MuiSvgIcon-root': { fontSize: 24 },
                    }}
                    disabled={disabled}
                  />
                }
                sx={{
                  marginLeft: 0,
                  marginRight: 0,
                }}
              />
            </Tooltip>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleApply}
            disabled={disabled}
            sx={{ mt: 1 }}
          >
            Применить
          </Button>
        </Box>
      </Popover>
    </>
  );
}