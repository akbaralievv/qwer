import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { convertToRuFormat } from 'src/utils/convernRuFormat';

import { useGetPositionQuery } from 'src/store/api/positionApi';
import { useGetContragentsQuery } from 'src/store/api/contragentAPI';

import Iconify from 'src/components/iconify';

import PDFFileCopy from './OrderForAdmissionsPDF copy';

export default function OrderForAdmissionsTableRow({
  row,
  idUser,
  columns,
  selected,
  handleClick,
  onRowClick,
  contragentName,
  docInfo,
}) {
  const [open, setOpen] = useState(null);
  // eslint-disable-next-line
  const [position, setPosition] = useState({
    rector: '',
    director: '',
  });
  const { data: positions } = useGetPositionQuery('?populate=*');
  const { data: pdfData } = useGetContragentsQuery(`/${idUser}?populate=*`);

  const handleOpenMenu = (event) => {
    event.stopPropagation();
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const renderCellContent = (column) => {
    if (column.id === 'docDate' || column.id === 'periodFrom' || column.id === 'periodTo') {
      return convertToRuFormat(row[column.id]);
    }
    if (column.id === 'contragent') {
      return row.contragentName || 'Не указано';
    }
    if (column.id === 'service') {
      return row.service.data?.attributes.title || 'Не указано';
    }
    if (column.id === 'division') {
      return row.division.data?.attributes.title || 'Не указано';
    }
    if (column.id === 'subdiv_one') {
      return row.subdiv_one.data?.attributes.title || 'Не указано';
    }
    if (column.id === 'autor') {
      const username = row.autor.data?.attributes.username || '';
      const usersurname = row.autor.data?.attributes.usersurname || '';
      const surnameInitial = usersurname ? usersurname[0].toUpperCase() : ''; // Берём первую букву фамилии
      return `${surnameInitial}.${username}`.trim() || 'Не указано';
    }
    if (typeof row[column.id] === 'object') {
      return row[column.id]?.title || JSON.stringify(row[column.id]);
    }
    return row[column.id];
  };
  useEffect(() => {
    if (positions?.data?.length) {
      const rectorName = positions.data
        .filter((el) => el.attributes.priority === 1)
        .map((el) => el.attributes?.user?.data?.attributes || '');
      const directorName = positions.data
        .filter((el) => el.attributes.priority === 2)
        .map((el) => el.attributes?.user?.data?.attributes || '');

      setPosition({
        rector: `${rectorName[0]?.usersurname} ${rectorName[0]?.username}` || '',
        director: `${directorName[0]?.usersurname} ${directorName[0]?.username}` || '',
      });
    }
  }, [positions]);

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
        {columns.map(
          (column) =>
            column.mapping === true && (
              <TableCell key={column.id}>{renderCellContent(column)}</TableCell>
            )
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
        <MenuItem onClick={handleCloseMenu}>
          <PDFDownloadLink
            document={
              <PDFFileCopy row={row} formData={pdfData?.data?.attributes} positions={position} />
            } // Pass the necessary data to PDF
            fileName={`${contragentName}-Приказ о зачислении №${
              docInfo.docNumber
            } от ${convertToRuFormat(docInfo.docDate)}.pdf`} // Customize the file name
            style={{ textDecoration: 'none', color: '#1877F2' }}
          >
            {({ loading }) => (loading ? 'Загрузка...' : 'Скачать PDF')}
          </PDFDownloadLink>
        </MenuItem>
      </Popover>
    </>
  );
}

OrderForAdmissionsTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  selected: PropTypes.bool.isRequired,
  handleClick: PropTypes.func.isRequired,
  onRowClick: PropTypes.func.isRequired,
  idUser: PropTypes.number.isRequired,
  contragentName: PropTypes.string.isRequired,
  docInfo: PropTypes.object.isRequired,
};
