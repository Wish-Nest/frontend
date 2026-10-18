import { Avatar, Box, Paper, Typography } from "@mui/material";
import moment from 'moment';
import 'moment/locale/fr';

export default function MessageRight({message, timestamp, photoURL, displayName}: {
    message: string;
    timestamp: string;
    photoURL?: string;
    displayName: string;
}) {
    const formattedTimestamp = timestamp ? moment(timestamp).locale('fr').calendar() : '';
    return (
        <Box mb={2} sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            mb: 2,
            textAlign: "right",
            width: "100%",
        }}>
            <Box textAlign="right" sx={{
                width: "70%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
            }}>
                <Typography variant="body2" color="textSecondary">
                    {displayName}
                </Typography>
                <Paper
                    elevation={6}
                    sx={{
                        borderRadius: "10px",
                        padding: "10px",
                        maxWidth: "70%",
                    }}
                >
                    <Typography variant="body1">{message}</Typography>
                </Paper>
                <Typography variant="caption" color="textSecondary">
                    {formattedTimestamp}
                </Typography>
            </Box>
            <Avatar src={photoURL} alt={displayName} sx={{
                ml: {xs: 1, sm: 2},
            }} />
        </Box>
    );
}