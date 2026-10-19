import * as React from 'react';
import {useEffect, useState} from "react";
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
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import {Delete, Edit} from "@mui/icons-material";
import {UserFamily} from "../../types/models";
import {API_BASE_URL} from "../../env";

interface RenameMemberButtonProps {
    member: UserFamily;
    /** Appelé après une modification réussie (typiquement pour rafraîchir la famille). */
    onRenamed?: () => void;
    /** Petit crayon discret, par exemple à côté d'un titre. */
    size?: "small" | "medium";
}

/**
 * Menu d'édition d'un membre : nom et image de profil.
 * Permet de modifier soi-même, ou un membre dont la liste est gérée par la famille.
 * L'autorisation réelle est vérifiée côté serveur.
 */
export default function RenameMemberButton({member, onRenamed, size = "small"}: RenameMemberButtonProps) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(member.name);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Image de profil
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [removed, setRemoved] = useState(false);

    // Aperçu du fichier choisi (URL objet, à révoquer quand il change/disparaît).
    useEffect(() => {
        if (!file) {
            setFilePreview(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setFilePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const previewUrl = filePreview
        ?? (!removed && member.image ? API_BASE_URL + member.image : null);

    const handleOpen = (event: React.MouseEvent) => {
        // Ne pas déclencher le onClick du conteneur (sélection du membre).
        event.stopPropagation();
        setName(member.name);
        setError(null);
        setFile(null);
        setRemoved(false);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const resetFileInput = () => {
        try {
            const input = document.getElementById('member-image-input') as HTMLInputElement | null;
            if (input) input.value = '';
        } catch (e) {
            // ignore
        }
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

            // Image : undefined = inchangée, sinon URL fraîchement uploadée ou null (retrait).
            let nextImage: string | null | undefined = undefined;
            if (file) {
                const form = new FormData();
                form.append('file', file);
                const res = await axios.post('/upload', form, {
                    headers: {'Content-Type': 'multipart/form-data'}
                });
                nextImage = res.data?.url ?? null;
            } else if (removed && member.image) {
                nextImage = null;
            }
            if (nextImage !== undefined) {
                await axios.put("/familymember/" + member.uuid + "/image", {
                    image: nextImage
                });
            }

            handleClose();
            if (onRenamed) {
                onRenamed();
            }
        } catch (e: any) {
            console.error("Failed to update member", e);
            setError(e?.response?.data?.error ?? "Erreur lors de l'enregistrement.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Tooltip title="Modifier">
                <IconButton
                    size={size}
                    aria-label={"Modifier " + member.name}
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
                <DialogTitle>Modifier {member.name}</DialogTitle>
                <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
                    <DialogContentText>
                        Modifiez le nom et la photo de profil de ce membre dans cette famille.
                    </DialogContentText>
                    {error && <Typography color="error">{error}</Typography>}
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box sx={{position: 'relative'}}>
                            <Avatar
                                src={previewUrl ?? undefined}
                                sx={{width: 72, height: 72}}
                            >
                                <Edit/>
                            </Avatar>
                            {previewUrl && (
                                <IconButton
                                    aria-label="Supprimer la photo"
                                    size="small"
                                    onClick={() => {
                                        setFile(null);
                                        setRemoved(true);
                                        resetFileInput();
                                    }}
                                    sx={{
                                        position: 'absolute',
                                        bottom: -6,
                                        right: -6,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {bgcolor: 'background.default'}
                                    }}
                                >
                                    <Delete fontSize="small"/>
                                </IconButton>
                            )}
                        </Box>
                        <Box>
                            <Button variant="outlined" component="label" size="small">
                                Choisir une photo
                                <input
                                    id="member-image-input"
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={(event) => {
                                        const f = event.target.files && event.target.files[0];
                                        if (f) {
                                            setFile(f);
                                            setRemoved(false);
                                        }
                                    }}
                                />
                            </Button>
                            {!previewUrl && (
                                <Typography variant="caption" sx={{display: 'block', mt: 0.5, color: 'text.secondary'}}>
                                    Aucune photo pour l'instant.
                                </Typography>
                            )}
                        </Box>
                    </Box>
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
