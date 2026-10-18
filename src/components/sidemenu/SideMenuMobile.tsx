import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MenuContent from './MenuContent';
import { Button } from '@mui/material';
import { LogoutRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../../provider/AuthProvider";
import Box from "@mui/material/Box";
import Tooltip from '@mui/material/Tooltip';
import VersionInfo from "./VersionInfo";

interface SideMenuMobileProps {
  open: boolean | undefined;
  toggleDrawer: (newOpen: boolean) => () => void;
}

export default function SideMenuMobile({ open, toggleDrawer }: SideMenuMobileProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        [`& .${drawerClasses.paper}`]: {
          backgroundImage: 'none',
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Stack
        sx={{
          maxWidth: '70dvw',
          height: '100%',
        }}
      >
        <Stack direction="row" sx={{ p: 2, pb: 0, gap: 1 }}>
          <Stack
            direction="row"
            sx={{ gap: 1, alignItems: 'center', flexGrow: 1, p: 1, minWidth: 0 }}
          >
            <Avatar
              sizes="small"
              alt={user?.email}
              sx={{ width: 24, height: 24, flexShrink: 0 }}
            />
            <Box sx={{ flex: '1 1 0', minWidth: 0, maxWidth: 'calc(100% - 56px)' }}>
              <Tooltip title={user?.email ?? ''} placement="top">
                <Typography component="p" variant="h6" noWrap sx={{
                  display: 'block',
                  width: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.email}
                </Typography>
              </Tooltip>
            </Box>
          </Stack>
        </Stack>
        <Divider />
        <Stack sx={{ flexGrow: 1 }}>
          <MenuContent onClick={() => {
            toggleDrawer(false);
          }} />
        </Stack>
      </Stack>
      <Box
          sx={{
            m: 1,
            textAlign: 'center',
          }}
      >
        <Typography variant="body2" color="text.secondary">
          WishNest, an open-source project
        </Typography>
        <Typography variant="body2" color="text.secondary">
          <a href="https://github.com/Wish-Nest" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </Typography>
        <VersionInfo/>
      </Box>
      <Stack sx={{ p: 2 }}>
        <Button variant="outlined" fullWidth startIcon={<LogoutRounded />} onClick={() => {
          logout();
          navigate("/login", { replace: true });
        }}>
          Se déconnecter
        </Button>
      </Stack>
    </Drawer>
  );
}