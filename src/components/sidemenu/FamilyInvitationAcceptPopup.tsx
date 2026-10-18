import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";
import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import {Invitation} from "../../types/models";
import {useAuth} from "../../provider/AuthProvider";

interface FamilyInvitationPopupProps {
    open: boolean;
    invitation: Invitation;
    handleClose: () => void;
    handleDelete: (invitation: Invitation) => void;
}

export default function FamilyInvitationAcceptPopup({ open, invitation, handleClose, handleDelete }: FamilyInvitationPopupProps) {
    const [username, setUsername] = React.useState<string>("");
    const {user} = useAuth();
    const [loading, setLoading] = React.useState<boolean>(false);

    function onSubmit(event: React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        setLoading(true);
        axios.post("/user/invitations/" + invitation?.uuid + "/accept", {
            username: username
        })
            .then(() => {
                handleClose();
                if(invitation !== null) handleDelete(invitation);
                setLoading(false);
            })
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: onSubmit,
                    sx: { backgroundImage: 'none' },
                },
            }}
        >
            <DialogTitle>Rejoindre la famille {invitation.familyName}</DialogTitle>
            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
            >
                <DialogContentText>
                    Pour continuer, comment doit-on vous appeler dans cette famille ?
                </DialogContentText>
                <OutlinedInput
                    autoFocus
                    required
                    margin="dense"
                    id="username"
                    name="username"
                    placeholder="Pseudonyme"
                    type="text"
                    fullWidth
                    onChange={(event) => setUsername(event.target.value)}
                />
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <Button onClick={handleClose}>Annuler</Button>
                <Button variant="contained" type="submit" disabled={loading}>
                    Continuer
                </Button>
            </DialogActions>
        </Dialog>
    );
}