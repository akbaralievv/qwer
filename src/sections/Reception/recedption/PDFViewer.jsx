/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { PDFViewer } from '@react-pdf/renderer';

import { Box, Modal, useTheme, IconButton, Typography, useMediaQuery } from '@mui/material';

import Iconify from 'src/components/iconify';

import PDFFileCopy from './OrderForAdmissionsPDF copy';

export default function PDFViewerModal({ open, onClose, row, formData, positions }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [isLoading, setIsLoading] = useState(true);

  // Отладочная информация
  console.log('PDFViewerModal props:', {
    open,
    row: !!row,
    formData: !!formData,
    positions: !!positions,
  });

  const getModalWidth = () => {
    if (isMobile) return '100%';
    if (isTablet) return '95%';
    return '90%';
  };

  const getModalHeight = () => {
    if (isMobile) return '100%';
    return '90%';
  };

  const getTitleFontSize = () => {
    if (isMobile) return '1rem';
    return '1.25rem';
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="pdf-viewer-modal"
      aria-describedby="pdf-viewer-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: getModalWidth(),
          height: getModalHeight(),
          maxWidth: '1200px',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            minHeight: 60,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
              fontSize: getTitleFontSize(),
            }}
          >
            Просмотр документа
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </Box>

        {/* PDF Content */}
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.paper',
                zIndex: 1,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Загрузка документа...
              </Typography>
            </Box>
          )}

          {row && formData ? (
            <PDFViewer
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              onLoad={handleLoad}
              onError={handleError}
            >
              <PDFFileCopy row={row} formData={formData} positions={positions} />
            </PDFViewer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Нет данных для отображения PDF
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
