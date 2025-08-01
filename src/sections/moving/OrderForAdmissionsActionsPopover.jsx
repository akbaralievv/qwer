/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';

import Popover from '@mui/material/Popover';
import MenuItem from '@mui/material/MenuItem';

import { convertToRuFormat } from 'src/utils/convernRuFormat';

import { useGetPositionQuery } from 'src/store/api/positionApi';
import { useGetContragentsQuery } from 'src/store/api/contragentAPI';

import Iconify from 'src/components/iconify';

import PDFFile2 from './PDF2';

export default function OrderForAdmissionsActionsPopover({
  open,
  anchorEl,
  anchorPosition,
  onClose,
  row,
  onEdit,
  editData,
  onOpenPdf,
}) {
  // Получаем id контрагента для запроса
  const contragentId = row?.contragent?.data?.id;

  const { data: pdfData, isLoading: pdfDataLoading } = useGetContragentsQuery(
    contragentId ? `/${contragentId}?populate=*` : null
  );
  const { data: positionsData } = useGetPositionQuery('?populate=*');
  const [position, setPosition] = useState({ rector: '', director: '' });

  useEffect(() => {
    if (positionsData?.data?.length) {
      const rectorName = positionsData.data
        .filter((el) => el.attributes.priority === 1)
        .map((el) => el.attributes?.user?.data?.attributes || '');
      const directorName = positionsData.data
        .filter((el) => el.attributes.priority === 2)
        .map((el) => el.attributes?.user?.data?.attributes || '');

      setPosition({
        rector: `${rectorName[0]?.usersurname || ''} ${rectorName[0]?.username || ''}`.trim(),
        director: `${directorName[0]?.usersurname || ''} ${directorName[0]?.username || ''}`.trim(),
      });
    }
  }, [positionsData]);

  return (
    <Popover
      open={!!open}
      anchorEl={anchorEl}
      anchorReference={anchorEl ? 'anchorEl' : 'anchorPosition'}
      anchorPosition={anchorPosition || { top: 100, left: 100 }}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{ sx: { width: 140 } }}
    >
      <MenuItem
        onClick={() => {
          onClose();
          onEdit({ idUser: editData?.id || row?.id, dataUser: editData?.attributes || row });
        }}
      >
        <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
        Изменить
      </MenuItem>
      <MenuItem
        onClick={() => {
          if (onOpenPdf && pdfData?.data?.attributes) {
            onOpenPdf({
              row: {
                ...row,
                contragentName: row?.contragent?.data?.attributes?.name,
              },
              formData: pdfData.data.attributes,
              positions: position,
            });
          }
          onClose();
        }}
        disabled={!pdfData?.data?.attributes || pdfDataLoading}
      >
        <Iconify icon="eva:eye-fill" sx={{ mr: 2, minWidth: 20 }} />
        {pdfDataLoading ? 'Загрузка...' : 'Просмотр'}
      </MenuItem>
      <MenuItem>
        {pdfData?.data?.attributes ? (
          <PDFDownloadLink
            document={
              <PDFFile2 row={row} formData={pdfData?.data?.attributes} positions={position} />
            }
            fileName={`${
              pdfData?.data?.attributes?.name || 'Контрагент'
            }-Дополнительное соглашение №${
              row?.docNumber || row?.doc_number || ''
            } от ${convertToRuFormat(row?.docDate || row?.doc_date)}.pdf`}
            style={{ textDecoration: 'none', color: '#1877F2' }}
          >
            {({ loading }) => (loading ? 'Загрузка...' : 'Скачать PDF')}
          </PDFDownloadLink>
        ) : (
          'Нет данных для PDF'
        )}
      </MenuItem>
    </Popover>
  );
}
