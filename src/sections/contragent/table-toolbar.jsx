import React from 'react';
import PropTypes from 'prop-types';

import { Box } from '@mui/system';
import { TextField } from '@mui/material';
import Select from '@mui/material/Select';
import Toolbar from '@mui/material/Toolbar';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function ContragentTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  names,
  setVisibleColumns,
  searchValue,
  setSearchValue,
}) {
  const [personName, setPersonName] = React.useState(names.map((name) => name.label));
  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === 'string' ? value.split(',') : value);
    setVisibleColumns(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Toolbar
      sx={{
        height: 50, 
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 0.5, 0, 1),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      <Box display="flex" alignItems="center" width="30%" gap={0.5}>
        <TextField
          select
          name="searchField"
          label="искать по"
          variant="outlined"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          fullWidth
          sx={{
            width: '45%',
            '& .MuiOutlinedInput-root': {
              height: 36, 
              fontSize: '0.875rem',
            },
          }}
        >
          {names.map((el) => (
            <MenuItem key={el.id} value={el.id}>
              {el.label}
            </MenuItem>
          ))}
        </TextField>
        <OutlinedInput
          sx={{
            width: '55%',
            height: 36, 
            fontSize: '0.875rem',
          }}
          value={filterName}
          onChange={onFilterName}
          placeholder={`поиск по ${names.find((el) => el.id === searchValue)?.label || ''}`}
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      </Box>
      <FormControl sx={{ m: 0.5, width: 300 }}>
        {' '}
        <InputLabel id="demo-multiple-checkbox-label">Колонки</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput label="Колонки" sx={{ height: 36 }} />} // Уменьшите высоту
          renderValue={(selected) => selected.join(', ')}
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem key={name.id} value={name.label}>
              <Checkbox checked={personName.indexOf(name.label) > -1} />
              <ListItemText primary={name.label} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Toolbar>
  );
}

ContragentTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  searchValue: PropTypes.string,
  onFilterName: PropTypes.func,
  names: PropTypes.array.isRequired,
  setVisibleColumns: PropTypes.func.isRequired,
  setSearchValue: PropTypes.func,
};
