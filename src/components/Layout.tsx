import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {CssVarsTheme} from "@mui/material";
import Typography from "@mui/material/Typography";
import MainGrid from "./MainGrid";
import SideMenu from "./sidemenu/SideMenu";
import ErrorsBox from "./ErrorsBox";
import AppMobileNavbar from "./AppMobileNavbar";
import {useEffect} from "react";

export default function Layout({children}: { children: React.ReactNode }) {
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <Box sx={{ display: 'flex' }}>
            <SideMenu />
            <AppMobileNavbar />
            {/*Main content */}
            <Box
                component="main"
                sx={(theme) => {
                    const cssVarsTheme = theme as unknown as CssVarsTheme; 
                    return {
                        flexGrow: 1,
                        backgroundColor: cssVarsTheme.vars
                            ? `rgba(${cssVarsTheme.vars.palette.background.defaultChannel} / 1)`
                            : alpha(cssVarsTheme.palette.background.default, 1),
                        overflow: 'auto',
                    };
                }}
            >
                <Stack
                    spacing={2}
                    sx={{
                        alignItems: 'center',
                        position: 'relative',
                        mx: 3,
                        pb: 5,
                        mt: { xs: 8, md: 0 },
                    }}
                >
                    <ErrorsBox/>
                    <MainGrid>{children}</MainGrid>
                </Stack>
            </Box>
        </Box>
    );
}