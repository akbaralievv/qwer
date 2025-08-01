/* eslint-disable react/prop-types */
import React from 'react';

import { List, Dialog, Button, ListItem, Typography, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function ModalDelete({ open, onClose, onConfirm, deleteRows }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Подтвердите удаление</DialogTitle>
      <DialogContent>
        <Typography>Вы действительно хотите удалить выбранные записи?</Typography>
        <List dense>
          {deleteRows.map(row => (
            <ListItem key={row.id}>
              № {row.docNumber} — {row.contragent}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Отмена</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Удалить</Button>
      </DialogActions>
    </Dialog>
  );
}