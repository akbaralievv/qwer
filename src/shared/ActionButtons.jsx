/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';

import { Box, Button } from '@mui/material';

import { useGetPositionQuery } from 'src/store/api/positionApi';
import { useGetContragentsQuery } from 'src/store/api/contragentAPI';

export default function ActionButtons({
  onAdd,
  onMassAdd, // новый пропс
  showMassAdd, // новый пропс
  onView,
  onEdit,
  onDelete,
  canView,
  canEdit,
  canDelete,
  pageType,
  onViewPdf,
  row,
}) {
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
    <Box sx={{ display: 'flex', gap: 2, mb: 3, ml: 0 }}>
      <Button
        variant="contained"
        sx={{
          borderRadius: 2,
          fontWeight: 600,
          textTransform: 'none',
          px: 3,
          minWidth: 130,
          height: 44,
          background: '#e0e0e0',
          color: '#222',
          boxShadow: 'none',
          '&:hover': { background: '#bdbdbd' },
        }}
        startIcon={<Icon icon="ic:round-add" width={22} height={22} color="#616161" />}
        disabled={canView}
        onClick={onAdd}
      >
        Добавить
      </Button>
      {showMassAdd && (
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            minWidth: 130,
            height: 44,
            background: '#e0e0e0',
            color: '#222',
            boxShadow: 'none',
            '&:hover': { background: '#bdbdbd' },
          }}
          startIcon={
            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              >
                <path d="M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3s-3.582-3-8-3s-8 1.343-8 3" />
                <path d="M4 6v6c0 1.657 3.582 3 8 3c1.075 0 2.1-.08 3.037-.224M20 12V6" />
                <path d="M4 12v6c0 1.657 3.582 3 8 3q.249 0 .495-.006M16 19h6m-3-3v6" />
              </g>
            </svg>
          }
          onClick={onMassAdd}
        >
          Массовое начисление
        </Button>
      )}
      <span>
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            minWidth: 130,
            height: 44,
            background: '#bdbdbd',
            color: '#222',
            boxShadow: 'none',
            '&:hover': { background: '#9e9e9e' },
          }}
          startIcon={<Icon icon="ic:round-visibility" width={22} height={22} color="#616161" />}
          onClick={() => {
            if (
              pageType === 'reception' ||
              ((pageType === 'moving' || pageType === 'deduction') &&
                onViewPdf &&
                pdfData?.data?.attributes &&
                row)
            ) {
              onViewPdf({
                row: {
                  ...row,
                  contragentName: row?.contragent?.data?.attributes?.name,
                },
                formData: pdfData.data.attributes,
                positions: position,
              });
            } else {
              onView();
            }
          }}
          disabled={!canView || (pageType === 'reception' && pdfDataLoading)}
        >
          Просмотр
        </Button>
      </span>
      <span>
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            minWidth: 130,
            height: 44,
            background: '#bdbdbd',
            color: '#222',
            boxShadow: 'none',
            '&:hover': { background: '#9e9e9e' },
          }}
          startIcon={<Icon icon="ic:round-edit" width={22} height={22} color="#616161" />}
          onClick={onEdit}
          disabled={!canEdit}
        >
          Редактировать
        </Button>
      </span>
      <span>
        <Button
          variant="contained"
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            minWidth: 130,
            height: 44,
            background: '#eeeeee',
            color: '#222',
            boxShadow: 'none',
            '&:hover': { background: '#e57373', color: '#fff' },
          }}
          onClick={onDelete}
          disabled={!canDelete}
        >
          <Icon
            icon="ic:round-delete"
            width={20}
            height={20}
            color="#b71c1c"
            style={{ marginRight: 8 }}
          />
          Удалить
        </Button>
      </span>
    </Box>
  );
}
