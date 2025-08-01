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

import ContragentPDFFile from './contragentPDF';

export default function ContragentTableRow({
  row,
  columns,
  selected,
  handleClick,
  onRowContragentClick,
}) {
  const [open, setOpen] = useState(null);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const getCellContent = (columnId, _row) => {
    if (columnId === 'division') {
      return _row.division?.data?.attributes?.title || '';
    }
    if (columnId === 'subdiv_one') {
      return _row.subdiv_one?.data?.attributes?.title || '';
    }
    return _row[columnId] || '';
  };

  return (
    <>
      <TableRow
        sx={{
          cursor: 'pointer',
          height: '1px',
          '& .MuiTableCell-root': {
            padding: '2px',
          },
        }}
        hover
        tabIndex={-1}
        role="checkbox"
        selected={selected}
        onClick={onRowContragentClick}
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
          column.mapping ? (
            <TableCell key={column.id} align={column.align}>{getCellContent(column.id, row)}</TableCell>
          ) : null
        )}

        <TableCell align="center" >
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
            onRowContragentClick('change');
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

      <ModalUi radius="10" open={pdfModalOpen} setOpen={setPdfModalOpen} width="30%" height='20%'>
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
  onRowContragentClick: PropTypes.func.isRequired,
};
