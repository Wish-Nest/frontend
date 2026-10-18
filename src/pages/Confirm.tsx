import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import ColorModeSelect from './../theme/ColorModeSelect';
import {useNavigate} from "react-router-dom";
import {useAuth} from "../provider/AuthProvider";
import { API_BASE_URL } from "../env";

const Card = styled(MuiCard)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'center',
    width: '100%',
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: 'auto',
    [theme.breakpoints.up('sm')]: {
        maxWidth: '450px',
    },
    boxShadow:
        'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
    ...theme.applyStyles('dark', {
        boxShadow:
            'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
    }),
}));

const ConfirmContainer = styled(Stack)(({ theme }) => ({
    height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
    minHeight: '100%',
    padding: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
        padding: theme.spacing(4),
    },
    '&::before': {
        content: '""',
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        inset: 0,
        backgroundImage:
            'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
        backgroundRepeat: 'no-repeat',
        ...theme.applyStyles('dark', {
            backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
        }),
    },
}));

export default function Confirm() {
    const [codeError, setCodeError] = React.useState(false);
    const [codeErrorMessage, setCodeErrorMessage] = React.useState('');
    const [globalError, setGlobalError] = React.useState(false);
    const [globalErrorMessage, setGlobalErrorMessage] = React.useState('');
    const { validate, user } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (codeError) {
            return;
        }
        const data = new FormData(event.currentTarget);

        if(!user?.uuid){
            setGlobalError(true);
            setGlobalErrorMessage("Utilisateur non trouvé, veuillez vous reconnecter.");
            navigate('/login', { replace: true });
            return;
        }

        fetch(API_BASE_URL + "/user/verify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uuid: user?.uuid,
                code: data.get('code'),
            }),
        }).then((response) => response.json())
            .then((data) => {
                if(data.error){
                    setGlobalError(true);
                    setGlobalErrorMessage(data.error);

                    return;
                }

                validate();

                navigate('/', { replace: true });
            })
            .catch(() => {
                setGlobalErrorMessage("Une erreur est survenue, veuillez réessayer.");
                setGlobalError(true);
            });
    };

    return (
        <ConfirmContainer direction="column" justifyContent="space-between">
            <ColorModeSelect sx={{ position: 'fixed', top: '1rem', right: '1rem' }} />
            <Card variant="outlined">
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
                >
                    Validation de l'email
                </Typography>
                <Typography variant="body2" align="center">
                    Un code de validation a été envoyé à votre adresse email. Veuillez entrer ce code ci-dessous pour vérifier votre adresse email et activer votre compte.
                </Typography>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 2,
                    }}
                >
                    {globalError && <Typography color="error">{globalErrorMessage}</Typography>}
                    <FormControl>
                        <FormLabel htmlFor="email">Code de validation</FormLabel>
                        <TextField
                            error={codeError}
                            helperText={codeErrorMessage}
                            id="code"
                            name="code"
                            placeholder="123456"
                            type="text"
                            required
                            fullWidth
                            variant="outlined"
                            color={codeError ? 'error' : 'primary'}
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                    >
                        Confirmer l'email
                    </Button>
                </Box>
            </Card>
        </ConfirmContainer>
    );
}