import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { usePathname } from 'src/routes/hooks';

import { useResponsive } from 'src/hooks/use-responsive';

import 'src/styles/nav.css';
// import { account } from 'src/_mock/account';
import { useGetUserQuery } from 'src/store/api/user/userApi';

import Scrollbar from 'src/components/scrollbar';

import { NAV } from './config-layout';
import navConfig from './config-navigation';

export default function Nav({ openNav, onCloseNav }) {
  const token = useSelector((state) => state.auth.accessToken);
  const pathname = usePathname();
  const upLg = useResponsive('up', 'lg');
  const { data: user } = useGetUserQuery(token ? '' : skipToken);
  const [myCompany, setMyCompany] = useState('');

  useEffect(() => {
    const setData = async () => {
      try {
        const awaitUserData = await user.mycompany.title;
        if (awaitUserData) {
          setMyCompany(awaitUserData);
        }
      } catch (error) {
        // console.log(error);
      }
    };
    setData();
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user]);

  const renderAccount = (
    <Box
      component={Link}
      to='/data/organization'
      sx={{
        my: 3,
        mx: 2.5,
        py: 2,
        px: 2.5,
        mt: 1,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
        textDecoration: 'none', // Убираем стандартное подчеркивание
        '&:hover': {
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.2),
        },
      }}
    >
      <Avatar
        sx={{ width: '51px', height: '45px' }}
        // eslint-disable-next-line
        src={'https://cdn-ilbhmmf.nitrocdn.com/XemuxbSYiGASzquUWnDwpGraAcWArmaZ/assets/images/optimized/rev-b3da972/kara-balta.gov.kg/wp-content/uploads/2025/06/ChatGPT-Image-5-%D0%B8%D1%8E%D0%BD.-2025-%D0%B3.-16_06_28.jpg'}
        alt="photoURL"
      />
      {/* <CorporateFareIcon>
        <Iconify icon="eva:edit-fill" />
      </CorporateFareIcon> */}
      <Box sx={{ ml: 2 }}>
        <Typography variant="subtitle2" sx={{ color: '#000000' }}>{myCompany}</Typography>
        {/* <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {account.role}
        </Typography> */}
      </Box>
    </Box>
  );

  const renderMenu = (
    <Stack component="nav" spacing={0.5} sx={{ px: 2 }}>
      {navConfig.map((item) => (
        <NavItem key={item.title} item={item} />
      ))}
    </Stack>
  );

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': {
          height: 1,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {renderAccount}
      {renderMenu}
      <Box sx={{ flexGrow: 1 }} />
    </Scrollbar>
  );

  return (
    <Box
      sx={{
        flexShrink: { lg: 0 },
        width: { lg: NAV.WIDTH },
      }}
    >
      {upLg ? (
        <Box
          sx={{
            height: 1,
            position: 'fixed',
            width: NAV.WIDTH,
            borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {renderContent}
        </Box>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          PaperProps={{
            sx: {
              width: NAV.WIDTH,
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

function NavItem({ item }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const active = item.path === pathname;

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <ListItemButton
      sx={{
        minHeight: 44,
        borderRadius: 0.75,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        fontWeight: 'fontWeightMedium',
        transition: 'font-size 0.2s ease-in-out',
        fontSize: active ? '1.1rem' : '1rem',
        ...(active && {
          color: 'primary.main',
          fontWeight: 'fontWeightSemiBold',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          '&:hover': {
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
          },
        }),
      }}
      onClick={(e) => {
        handleItemClick(item.path);
        e.stopPropagation();
      }}
    >
      {item.children && item.children.length > 0 ? (
        <div>
          <Accordion sx={{ background: 'none', padding: '0' }} defaultExpanded={false}>
            <AccordionSummary
              style={{ display: 'flex', alignItems: 'center', padding: '0', margin: '0' }}
              aria-controls="panel1-content"
              id="panel1-header"
            >
              <Box component="span" sx={{ width: 24, height: 24, mr: 2, mt: 2 }}>
                {item.icon}
              </Box>
              <Typography sx={{ ml: 2 }}>{item.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1} sx={{ width: '100%' }}>
                {item.children.map((child) => (
                  <button
                    type="button"
                    key={child.title}
                    onClick={(e) => {
                      handleItemClick(child.path);
                      e.stopPropagation();
                    }}
                    style={{
                      justifyContent: 'flex-start',
                      background: 'none',
                      border: 'none',
                      color: 'black',
                      paddingLeft: 5,
                      fontSize: pathname === child.path ? '17px' : '15px',
                      marginLeft: pathname === child.path ? '3.5px' : '0px',
                      cursor: 'pointer',
                      padding: '4px 20px',
                      textAlign: 'start',
                    }}
                  >
                    {child.title}
                  </button>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </div>
      ) : (
        <>
          <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
            {item.icon}
          </Box>
          <Box component="span">{item.title}</Box>
        </>
      )}
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object.isRequired,
};
