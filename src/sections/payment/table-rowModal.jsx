import PropTypes from 'prop-types';
import React, { useState } from 'react';

import IconButton from '@mui/material/IconButton';
// eslint-disable-next-line
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
// eslint-disable-next-line
import TableCell from '@mui/material/TableCell';
// eslint-disable-next-line
import Iconify from 'src/components/iconify';

export default function ContragentTableRow({ row, columns, selected, handleClick, onRowClick }) {
  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  return (
    <>
      <TableRow
        sx={{ cursor: 'pointer' }}
        hover
        tabIndex={-1}
        role="checkbox"
        selected={selected}
        onClick={onRowClick}
      >
        <TableCell padding="checkbox">
          <Checkbox
            disableRipple
            checked={selected}
            onChange={handleClick}
            onClick={(event) => event.stopPropagation()}
          />
        </TableCell>

        {columns.map((column) =>
          column.mapping === true ? <TableCell key={column.id}>{row[column.id]}</TableCell> : null
        )}

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            onRowClick();
          }}
        >
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Изменить
        </MenuItem>
      </Popover>
    </>
  );
}

ContragentTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  selected: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
};
