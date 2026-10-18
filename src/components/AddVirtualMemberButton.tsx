import Button from "@mui/material/Button";
import {Add} from "@mui/icons-material";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import {useState} from "react";
import axios from "axios";
import Typography from "@mui/material/Typography";

export default function AddVirtualMemberButton(props: {familyId: string, onAdded: () => void}) {
    const [open, setOpen] = useState(false);
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string|null>('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setOpen(false);
    }

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!username || username.trim().length === 0) {
            setError('Le nom d\'utilisateur est requis');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await axios.post('/family/virtual-member', {
                familyId: props.familyId,
                username: username.trim()
            });
            handleClose();
            setUsername('');
            props.onAdded();
        } catch (e: any) {
            console.error('Failed to create virtual member', e);
            setError(e?.response?.data?.error ?? 'Erreur lors de la création du membre virtuel');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button
                variant={"outlined"}
                color={"primary"}
                startIcon={<Add/>}
                onClick={() => setOpen(true)}
            >
                Ajouter membre virtuel
            </Button>
            <Dialog open={open}
                    onClose={handleClose}
                    slotProps={{
                        paper: {
                            component: 'form',
                            onSubmit: onSubmit,
                            sx: { backgroundImage: 'none' },
                        },
                    }}>
                <DialogTitle>Ajouter un membre virtuel</DialogTitle>
                <DialogContent
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
                >
                    <DialogContentText>
                        Entrez le nom du membre virtuel (pas d'email requis).
                    </DialogContentText>
                    {error && <Typography color="error">{error}</Typography>}
                    <OutlinedInput
                        autoFocus
                        required
                        margin="dense"
                        id="username"
                        name="username"
                        placeholder="Nom du membre"
                        value={username}
                        fullWidth
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ pb: 3, px: 3 }}>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button variant="contained" type="submit" disabled={loading}>
                        Ajouter
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

