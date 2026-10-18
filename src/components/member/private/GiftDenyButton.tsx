import {Gift} from "../../../types/models";
import {useState} from "react";
import axios from "axios";
import Button from "@mui/material/Button";
import {CircularProgress} from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

export default function GiftDenyButton({gift, onUpdated}: {
    gift: Gift,
    onUpdated?: () => void
}){
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false);

    function denyGift() {
        setLoading(true);
        return axios.post("/gift/" + gift.uuid + "/deny")
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
                color="warning"
                onClick={() => setOpen(true)}
                disabled={loading}
                startIcon={loading ? <CircularProgress/> : null}
            >
                Ne plus prendre ce cadeau
            </Button>
            <Dialog open={open}>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vous retirer de ce cadeau ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">
                        Annuler
                    </Button>
                    <Button onClick={() => {
                        denyGift().then(() => {
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