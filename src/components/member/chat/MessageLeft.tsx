import { Avatar, Box, Paper, Typography } from "@mui/material";
import moment from 'moment';
import 'moment/locale/fr';

export default function MessageLeft({message, timestamp, photoURL, displayName}: {
    message: string;
    timestamp: string;
    photoURL?: string;
    displayName: string;
}) {
    const formattedTimestamp = timestamp ? moment(timestamp).locale('fr').calendar() : '';
    return (
        <Box sx={{
            display: "flex",
            alignItems: "flex-start",
            mb: 2,
            width: "100%",
            textAlign: "left",
        }}>
            <Avatar src={photoURL} alt={displayName} sx={{ mr: 2 }} />
            <Box sx={{
                width: "70%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
            }}>
                <Typography variant="body2" color="textSecondary">
                    {displayName}
                </Typography>
                <Paper
                    elevation={3}
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
        </Box>
    );
}