import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {isRouteErrorResponse, useRouteError} from "react-router-dom";

/**
 * errorElement du routeur : remplace l'écran blanc "Unexpected Application Error!"
 * par une page exploitable avec un bouton de rechargement.
 */
export default function RouteError() {
    const error = useRouteError();

    const message = isRouteErrorResponse(error)
        ? `${error.status} ${error.statusText}`
        : error instanceof Error
            ? error.message
            : "Erreur inattendue";

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: 2,
            p: 2,
            textAlign: 'center',
        }}>
            <Typography variant="h5" component="h1">
                Une erreur est survenue
            </Typography>
            <Typography variant="body2" component="div" color="text.secondary">
                {message}
            </Typography>
            <Button variant="outlined" onClick={() => window.location.reload()}>
                Réessayer
            </Button>
        </Box>
    );
}
