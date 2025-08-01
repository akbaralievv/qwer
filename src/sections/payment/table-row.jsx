import { useState } from 'react';
import PropTypes from 'prop-types';
import { PDFDownloadLink } from '@react-pdf/renderer';

import { Box } from '@mui/system';
import {
  Button,
  Popover,
  TableRow,
  Checkbox,
  MenuItem,
  TableCell,
  IconButton,
  Typography,
} from '@mui/material';

import ModalUi from 'src/ui/ModalUi';

import Iconify from 'src/components/iconify';
// eslint-disable-next-line
import ContragentPDFFile from './contragentPDF';

export default function ContragentTableRow({ row, columns, selected, handleClick, onRowClick }) {
  const [open, setOpen] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };
console.log("kkkkkk", columns)
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

        {columns?.map((column) =>
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
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setPdfModalOpen(true);
          }}
        >
          <Iconify icon="eva:file-text-outline" sx={{ mr: 2 }} />
          pdf
        </MenuItem>
      </Popover>

      <ModalUi radius="10" open={pdfModalOpen} setOpen={setPdfModalOpen} width="30%">
        <Typography variant="h6" align="center" gutterBottom>
          Скачать PDF файл контрагента
        </Typography>
        <Box mt={7} display="flex" justifyContent="center" gap={10} alignItems="center">
          <PDFDownloadLink
            document={<ContragentPDFFile contragent={row} />}
            fileName={`Contragent-${row.name}.pdf`}
          >
            {({ loading }) => (
              <Button variant="contained">
                {loading ? 'Загрузка документа...' : 'Скачать PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <Button
            variant="outlined"
            fullWidth
            sx={{ width: '30%' }}
            onClick={() => setPdfModalOpen(false)}
          >
            Закрыть
          </Button>
        </Box>
      </ModalUi>
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
