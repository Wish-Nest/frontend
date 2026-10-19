import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, IconButton, Box, CircularProgress, LinearProgress, Typography } from "@mui/material";
import {useEffect, useState} from "react";
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { API_BASE_URL } from '../../env';

export default function GiftPopup({ setOpen, open, content, title, description, initialLinks, initialImage, onAdd }: {
    setOpen: (open: boolean) => void,
    open: boolean,
    content: string | null,
    title: string | null,
    description : string,
    initialLinks?: string[],
    initialImage?: string | null,
    onAdd: (title: string, content: string, additionalLinks?: string[], image?: string | null) => Promise<void>
}) {
    const [_title, setTitle] = useState(title);
    const [_content, setContent] = useState(content);
    const [additionalLinks, setAdditionalLinks] = useState<string[]>(initialLinks ?? []);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(initialImage ?? null);
    const [removed, setRemoved] = useState<boolean>(false);
    /** Progression de l'envoi du fichier (null = pas d'envoi en cours). */
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const edit = content !== null && title !== null;
    // Nouveau: gestion d'erreur pour le titre obligatoire
    const [titleError, setTitleError] = useState<string | null>(null);

    useEffect(() => {
        setContent(content);
        setTitle(title);
        setAdditionalLinks(initialLinks ?? []);
        setPreview(initialImage ?? null);
        setRemoved(false);
        // reset erreur à l'ouverture
        setTitleError(null);
    }, [open, content, title, initialLinks, initialImage]);

    useEffect(() => {
        if (file) {
            const objUrl = URL.createObjectURL(file);
            setPreview(objUrl);
            return () => {
                URL.revokeObjectURL(objUrl);
            }
        } else {
            // if no file, keep initialImage (already set in effect above) or null
            if (!initialImage || removed) setPreview(null);
        }
    }, [file, initialImage, removed]);

    function updateLink(index: number, value: string) {
        setAdditionalLinks(prev => {
            const copy = [...prev];
            copy[index] = value;
            return copy;
        })
    }

    function addLink() {
        setAdditionalLinks(prev => [...prev, ""]);
    }

    function removeLink(index: number) {
        setAdditionalLinks(prev => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {
        // Seul le titre est obligatoire
        const trimmedTitle = (_title ?? '').trim();
        if (!trimmedTitle) {
            setTitleError('Le titre est obligatoire');
            return;
        }
        setLoading(true);
        try {
            let imageUrl: string | null | undefined = undefined;
            if (file) {
                const form = new FormData();
                form.append('file', file);
                setUploadProgress(0);
                const res = await axios.post('/upload', form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (event) => {
                        if (event.total) {
                            setUploadProgress(Math.min(100, Math.round(event.loaded * 100 / event.total)));
                        }
                    }
                });
                imageUrl = res.data?.url;
            } else if (initialImage && !removed) {
                // if editing and no new file chosen, keep the initial image unless it was removed
                imageUrl = initialImage;
            } else if (removed) {
                // explicitly request deletion of existing image
                imageUrl = null;
            }

            await onAdd(trimmedTitle, (_content ?? '').trim(), additionalLinks.filter(l => l && l.trim() !== ""), imageUrl);
            setFile(null);
            setRemoved(false);
        } catch (err) {
            console.error('Error submitting gift:', err);
            // keep dialog open on error
            return;
        } finally {
            setLoading(false);
            setUploadProgress(null);
            setOpen(false);
        }
    }

    return (

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>
                {edit ? "Modifier le cadeau" : "Proposer un cadeau"}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {description}

                </DialogContentText>
                {/* Large image preview (visible at top of popup) */}
                {preview && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ position: 'relative', width: '100%', maxWidth: 520 }}>
                            <img src={API_BASE_URL +  preview} alt={_title ?? 'prévisualisation'} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }} />
                            <IconButton aria-label="supprimer l'image" onClick={() => {
                                if (file) {
                                    setFile(null);
                                    setRemoved(true);
                                } else {
                                    setRemoved(true);
                                    setPreview(null);
                                }
                                try { const input = document.getElementById('gift-image-input') as HTMLInputElement | null; if (input) input.value = ''; } catch(e){}
                            }} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.8)' }}>
                                <Delete />
                            </IconButton>
                        </Box>
                    </Box>
                )}
                <TextField
                    autoFocus
                    margin="dense"
                    id="title"
                    label="Titre"
                    type="text"
                    fullWidth
                    variant="standard"
                    // requis: astérisque rouge + validation
                    required
                    sx={{ '& .MuiFormLabel-asterisk': { color: 'error.main' } }}
                    error={!!titleError}
                    helperText={titleError ?? ''}
                    value={_title ?? ''}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (titleError) {
                            const v = e.target.value.trim();
                            setTitleError(v ? null : 'Le titre est obligatoire');
                        }
                    }}
                />
                <TextField
                    margin="dense"
                    id="content"
                    label="Description"
                    type="text"
                    fullWidth
                    multiline
                    rows={4}
                    variant="standard"
                    // non obligatoire
                    value={_content ?? ''}
                    onChange={(e) => {
                        setContent(e.target.value);
                    }}
                />
                {
                    additionalLinks.map((link, idx) => (
                        <div key={idx} style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 8}}>
                            <TextField
                                margin="dense"
                                label={`Lien ${idx+1}`}
                                type="url"
                                fullWidth
                                variant="standard"
                                value={link}
                                onChange={(e) => updateLink(idx, e.target.value)}
                            />
                            <IconButton size="small" onClick={() => removeLink(idx)}>
                                <Delete fontSize="small" />
                            </IconButton>
                        </div>
                    ))
                }
                <Button startIcon={<Add/>} onClick={addLink} sx={{mt: 1}}>Ajouter un lien</Button>

                <div style={{marginTop: 12}}>
                    <input
                        accept="image/*"
                        id="gift-image-input"
                        type="file"
                        onChange={(e) => {
                            const f = e.target.files && e.target.files[0];
                            if (f) {
                                setFile(f);
                                setRemoved(false);
                            }
                        }}
                    />
                </div>

                {uploadProgress !== null && (
                    <Box sx={{mt: 1}}>
                        <LinearProgress variant="determinate" value={uploadProgress}/>
                        <Typography variant="caption" color="text.secondary">
                            Envoi de l'image… {uploadProgress}%
                        </Typography>
                    </Box>
                )}

            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpen(false)} color="inherit">
                    Annuler
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained"
                        disabled={loading}
                >
                    {loading ? <CircularProgress size={20} color="inherit"/> : (edit ? "Modifier" : "Proposer")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}