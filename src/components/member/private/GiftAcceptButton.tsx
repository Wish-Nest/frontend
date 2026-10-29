import {Gift} from "../../../types/models";
import {useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import {CircularProgress} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

export default function GiftAcceptButton({gift, onUpdated}: {
    gift: Gift,
    onUpdated?: () => void
 }){
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);

    function acceptGift() {
        setLoading(true);
        // Corps JSON vide obligatoire : sans Content-Type, Fastify renvoie 415
        // quand un proxy (Cloudflare) transmet la requête en chunked.
        return axios.post("/gift/" + gift.uuid + "/accept", {})
            .then(() => {
                if (onUpdated) {
                    onUpdated();
                }
            })
            .finally(() => {
                setLoading(false);
            })
    }

    return (
        <>
            <Button
                sx={{width: '100%'}}
                variant="contained"
                color={"success"}
                onClick={() => setOpen(true)}
                disabled={loading}
                startIcon={loading ? <CircularProgress/> : null}
            >
                Prendre le cadeau
            </Button>
            <Dialog open={open}>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir prendre ce cadeau ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">
                        Annuler
                    </Button>
                    <Button onClick={() => {
                        acceptGift().finally(() => {
                            setOpen(false);
                        })
                    }} color="primary" autoFocus>
                        Oui
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}