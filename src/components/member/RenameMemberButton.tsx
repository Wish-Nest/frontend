import * as React from 'react';
import {useState} from "react";
import axios from "axios";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import Typography from "@mui/material/Typography";
import {Edit} from "@mui/icons-material";
import {UserFamily} from "../../types/models";

interface RenameMemberButtonProps {
    member: UserFamily;
    /** Appelé après un renommage réussi (typiquement pour rafraîchir la famille). */
    onRenamed?: () => void;
    /** Petit crayon discret, par exemple à côté d'un titre. */
    size?: "small" | "medium";
}

/**
 * Permet de renommer un membre : soi-même, ou un membre dont la liste est gérée par la famille.
 * L'autorisation réelle est vérifiée côté serveur.
 */
export default function RenameMemberButton({member, onRenamed, size = "small"}: RenameMemberButtonProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(member.name);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleOpen = (event: React.MouseEvent) => {
        // Ne pas déclencher le onClick du conteneur (sélection du membre).
        event.stopPropagation();
        setName(member.name);
        setError(null);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmed = name.trim();
        if (trimmed.length === 0) {
            setError("Le nom ne peut pas être vide.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.put("/familymember/" + member.uuid + "/name", {
                name: trimmed
            });
            handleClose();
            if (onRenamed) {
                onRenamed();
            }
        } catch (e: any) {
            console.error("Failed to rename member", e);
            setError(e?.response?.data?.error ?? "Erreur lors du renommage.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Tooltip title="Renommer">
                <IconButton
                    size={size}
                    aria-label={"Renommer " + member.name}
                    onClick={handleOpen}
                >
                    <Edit fontSize={size === "small" ? "small" : "medium"}/>
                </IconButton>
            </Tooltip>
            <Dialog
                open={open}
                onClose={handleClose}
                // Le portail React continue de faire remonter les évènements : sans cela,
                // cliquer dans la boîte de dialogue déclenche le onClick de la ligne du
                // membre (navigation), ce qui ferme la boîte et annule la soumission.
                onClick={(event: React.MouseEvent) => event.stopPropagation()}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: onSubmit,
                        sx: {backgroundImage: 'none'},
                    },
                }}
            >
                <DialogTitle>Renommer {member.name}</DialogTitle>
                <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
                    <DialogContentText>
                        Comment souhaitez-vous appeler ce membre dans cette famille ?
                    </DialogContentText>
                    {error && <Typography color="error">{error}</Typography>}
                    <OutlinedInput
                        autoFocus
                        required
                        margin="dense"
                        id="member-name"
                        name="member-name"
                        placeholder="Nom du membre"
                        value={name}
                        fullWidth
                        inputProps={{maxLength: 64}}
                        onChange={(event) => setName(event.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{pb: 3, px: 3}}>
                    <Button onClick={handleClose}>Annuler</Button>
                    <Button variant="contained" type="submit" disabled={loading}>
                        Enregistrer
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
