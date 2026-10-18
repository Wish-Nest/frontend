import * as React from 'react';
import { styled } from '@mui/material/styles';
import { dividerClasses } from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { paperClasses } from '@mui/material/Paper';
import { listClasses } from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon, { listItemIconClasses } from '@mui/material/ListItemIcon';
import {LogoutRounded, MoreVertRounded} from '@mui/icons-material';
import NotificationsActiveRounded from '@mui/icons-material/NotificationsActiveRounded';
import {useNavigate} from "react-router-dom";
import {Badge, badgeClasses, IconButton, IconButtonProps} from "@mui/material";
import {useAuth} from "../../provider/AuthProvider";
import { requestNotificationPermissionAndSubscribe } from '../../pwa/initPWA';

const MenuItem = styled(MuiMenuItem)({
    margin: '2px 0',
});

interface MenuButtonProps extends IconButtonProps {
    showBadge?: boolean;
}

function MenuButton({
    showBadge = false,
    ...props
}: MenuButtonProps) {
    return (
        <Badge
            color="error"
            variant="dot"
            invisible={!showBadge}
            sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
        >
            <IconButton size="small" {...props} />
        </Badge>
    );
}

export default function OptionsMenu() {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [notifSupported, setNotifSupported] = React.useState(false);
    const [notifPermission, setNotifPermission] = React.useState<NotificationPermission>('default');

    React.useEffect(() => {
        const supported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
        setNotifSupported(!!supported);
        if (supported) {
            setNotifPermission(Notification.permission);
        }
    }, []);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const enableNotifications = async () => {
        try {
            await requestNotificationPermissionAndSubscribe();
            setNotifPermission(Notification.permission);
        } catch (e) {
            // ignore
        }
    }

    const showEnableNotif = notifSupported && notifPermission !== 'granted';

    return (
        <React.Fragment>
            <MenuButton
                aria-label="Ouvrir le menu"
                onClick={handleClick}
                sx={{ borderColor: 'transparent' }}
            >
                <MoreVertRounded />
            </MenuButton>
            <Menu
                anchorEl={anchorEl}
                id="menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                    [`& .${listClasses.root}`]: {
                        padding: '4px',
                    },
                    [`& .${paperClasses.root}`]: {
                        padding: 0,
                    },
                    [`& .${dividerClasses.root}`]: {
                        margin: '4px -4px',
                    },
                }}
            >
                {showEnableNotif && (
                    <MenuItem
                        onClick={enableNotifications}
                        sx={{
                            [`& .${listItemIconClasses.root}`]: {
                                ml: 'auto',
                                minWidth: 0,
                            },
                        }}
                    >
                        <ListItemText>Activer les notifications</ListItemText>
                        <ListItemIcon>
                            <NotificationsActiveRounded fontSize="small" />
                        </ListItemIcon>
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() => {
                        logout();
                        navigate("/login", { replace: true });
                    }}
                    sx={{
                        [`& .${listItemIconClasses.root}`]: {
                            ml: 'auto',
                            minWidth: 0,
                        },
                    }}
                >
                    <ListItemText>Se déconnecter</ListItemText>
                    <ListItemIcon>
                        <LogoutRounded fontSize="small" />
                    </ListItemIcon>
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}