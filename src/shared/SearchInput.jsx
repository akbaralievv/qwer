/* eslint-disable react/prop-types */
import React from 'react';
import { Icon } from '@iconify/react';

import { TextField, IconButton, InputAdornment } from '@mui/material';

export default function SearchInput({
  value,
  onChange,
  onClear,
  onFocus,
  onBlur,
  placeholder = 'Поиск',
  sx = {},
  onSearchNext, // новый проп
  searchIndex,
  searchCount,
  ...props
}) {
  return (
    <TextField
      size="small"
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      sx={{
        background: value ? '#fffde7' : '#ededed',
        borderRadius: 2,
        minWidth: 220,
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          fontSize: 15,
          background: value ? '#fffde7' : '#ededed',
          height: 44,
          paddingRight: 0,
          border: value ? '1.5px solid #fbc02d' : 'none',
          '& input': {
            background: 'transparent',
          },
          '& fieldset': {
            borderColor: value ? '#fbc02d' : 'transparent',
          },
        },
        '& .MuiFormHelperText-root': {
          background: value ? '#fffde7' : '#ededed',
          margin: 0,
          paddingLeft: 2,
          paddingRight: 2,
          borderRadius: 2,
          fontSize: 13,
          minHeight: 20,
        },
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton
              size="small"
              onClick={onSearchNext}
              sx={{ color: '#616161' }}
              disabled={!searchCount}
            >
              <Icon icon="ic:round-search" width={22} height={22} color="#616161" />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={onClear}
              sx={{ color: '#616161' }}
            >
              <Icon icon="ic:round-close" width={18} height={18} color="#616161" />
            </IconButton>
          </InputAdornment>
        ),
      }}
      helperText={
        value && searchCount > 0
          ? `${searchIndex + 1} из ${searchCount}`
          : undefined
      }
      {...props}
    />
  );
}