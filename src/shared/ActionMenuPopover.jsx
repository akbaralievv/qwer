/* eslint-disable react/prop-types */
import React from 'react';
import { Icon } from '@iconify/react';

import { Popover, MenuItem } from '@mui/material';

const ActionMenuPopover = React.memo(({
  open,
  anchorEl,
  anchorPosition,
  onClose,
  onView,
  onEdit,
  onDelete,
  selectedRow,
}) => (
  <Popover
    open={open}
    anchorEl={anchorEl}
    anchorReference={anchorPosition ? "anchorPosition" : "anchorEl"}
    anchorPosition={anchorPosition}
    onClose={onClose}
    anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{
      sx: { width: 180 },
    }}
  >
    <MenuItem onClick={() => { onView(selectedRow); onClose(); }}>
      <Icon icon="ic:round-visibility" width={22} height={22} color="#616161" style={{ marginRight: "12px" }} />
      Просмотр
    </MenuItem>
    <MenuItem onClick={() => { onEdit(); onClose(); }}>
      <Icon icon="ic:round-edit" width={22} height={22} color="#616161" style={{ marginRight: "12px" }} />
      Редактировать
    </MenuItem>
    <MenuItem onClick={() => { onDelete(); onClose(); }}>
      <Icon icon="ic:round-delete" width={20} height={20} color="#b71c1c" style={{ marginRight: "12px" }} />
      Удалить
    </MenuItem>
  </Popover>
));

export default ActionMenuPopover;