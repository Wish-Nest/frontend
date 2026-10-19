import {_GiftPrivateData, AdditionnalGift, Gift, isAdditionnalGift} from "../../../types/models";
import Button from "@mui/material/Button";
import {Check, Close, Lock, PriorityHigh} from "@mui/icons-material";
import {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import {Alert, Box, Chip, Grid, IconButton, Paper, Tooltip} from "@mui/material";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import {useAuth} from "../../../provider/AuthProvider";
import {useFamily} from "../../../provider/FamilyProvider";
import GiftAcceptButton from "./GiftAcceptButton";
import GiftDenyButton from "./GiftDenyButton";
import PrivateContentChat from "../chat/PrivateContentChat";
import {useNavigate, useParams} from "react-router-dom";
import {useMemberSelected} from "../../../provider/MemberSelectedProvider";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { API_BASE_URL } from '../../../env';
import { Chat } from "@mui/icons-material";

function getLinksFromGift(gift: any): string[] {
    return gift.additionalLinks ?? gift.additional_links ?? [];
}

function formatLinkLabel(link: string, maxLen = 30) {
    try {
        const u = new URL(link);
        const base = u.hostname + u.pathname;
        if (base.length <= maxLen) return base;
        return base.slice(0, maxLen - 3) + '...';
    } catch (e) {
        if (link.length <= maxLen) return link;
        return link.slice(0, maxLen - 3) + '...';
    }
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (e) {
        console.error('Copy failed', e);
    }
}

export default function GiftPrivateContentPopup({gift, privateData, updatePrivateData}: {
    gift: Gift | AdditionnalGift,
    privateData: _GiftPrivateData | false | null,
    updatePrivateData: () => void
}) {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const { family } = useFamily();
    const { member } = useMemberSelected();
    const { giftUuid } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if(member && giftUuid && gift.uuid && gift.uuid === giftUuid && privateData !== false) {
            setOpen(true);
        }
    }, [member, giftUuid, gift, privateData]);

    function getFamilyMemberByUuid(uuid: string) {
        return family?.members?.find((v) => v.userUuid === uuid);
    }

    function handleOpen() {
        setOpen(true);
        navigate(`/families/${family?.uuid}/member/${member?.uuid}/gifts/${gift.uuid}`);
    }

    function handleClose() {
        setOpen(false);
        navigate(`/families/${family?.uuid}/member/${member?.uuid}`);
    }

    return (
        <>
            <Button
                disabled={privateData === false}
                variant={"outlined"}
                endIcon={privateData === false ? <Lock/> : null}
                onClick={privateData === false ? () => {} : handleOpen}
            >
                Voir plus
                {privateData !== false && ((privateData?.messages.length ?? 0) !== 0) &&  (
                    <Chip sx={{marginLeft: '0.5rem'}} icon={<Chat></Chat>} label={(privateData?.messages.length ?? 0)}/>
                )}
            </Button>
            {privateData &&
            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth={"lg"}
                sx={{
                    '& .MuiDialog-paper': {
                        margin: {xs: 1},
                        width: {xs: '100%'},
                    }
                }}
            >
                <DialogActions>
                    <IconButton onClick={handleClose}>
                        <Close   />
                    </IconButton>
                </DialogActions>
                <DialogContent sx={{
                    padding: {xs: 1}
                }}>
                    <Grid container spacing={2}>
                        <Grid size={{
                            xs: 12,
                            sm: 12,
                            md: 5
                        }}>
                            <Paper sx={{
                                padding: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: "space-between",
                                alignItems: "center",
                                height: '100%',
                                zIndex: 2
                            }}>
                                <Box>
                                    <Typography variant="caption">
                                        Ces données sont privées et ne peuvent être consultées que par les membres de la famille ayant les droits nécessaires.
                                    </Typography>
                                    <Divider sx={{my: 2}}/>
                                    <Typography variant="h5">
                                        {gift.title}
                                    </Typography>
                                    {isAdditionnalGift(gift) && <Typography variant="subtitle2" sx={{
                                        marginBottom: '1rem',
                                        color: 'var(--template-palette-text-secondary)'
                                    }}>
                                        {gift.byUserUuid === user?.uuid ? "Vous avez" : (getFamilyMemberByUuid(gift.byUserUuid) ? (getFamilyMemberByUuid(gift.byUserUuid)?.name + " a") : "Inconnu a")} proposé ce cadeau
                                    </Typography>}
                                    <Typography variant="body1">
                                        {gift.content}
                                    </Typography>
                                    {/* Image preview for the gift (if exists) */}
                                    { (gift as any).image && (
                                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
                                            <Box sx={{ width: '100%', maxWidth: 720, position: 'relative' }}>
                                                <img src={API_BASE_URL +  (gift as any).image} alt={gift.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 8 }} />
                                            </Box>
                                        </Box>
                                    )}
                                    {/* Liens annexes */}
                                    {getLinksFromGift(gift).length > 0 && (
                                        <Box sx={{mt: 2, width: '100%'}}>
                                            <Divider sx={{my: 2}}/>
                                            <Typography variant="subtitle2">Liens associés :</Typography>
                                            <Box component="ul" sx={{pl: 2, mt: 1, width: '100%'}}>
                                                {getLinksFromGift(gift).map((link, i) => (
                                                    <li key={i}>
                                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                                            <Tooltip title={link}>
                                                                <a href={link} target="_blank" rel="noreferrer" style={{maxWidth: '100%', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                                                    {formatLinkLabel(link)}
                                                                </a>
                                                            </Tooltip>
                                                            <IconButton size="small" aria-label="ouvrir" href={link} target="_blank" rel="noreferrer">
                                                                <OpenInNewIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" aria-label="copier" onClick={() => copyToClipboard(link)}>
                                                                <ContentCopyIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </li>
                                                ))}
                                            </Box>
                                        </Box>
                                    )}
                                    <Divider sx={{my: 2}}/>
                                    {privateData.takenBy &&
                                        (privateData.takenBy === user?.uuid ?
                                            (<Alert icon={<PriorityHigh fontSize="inherit" />} severity="warning" sx={{mb: 2}}>
                                                Vous avez prévu de prendre ce cadeau
                                            </Alert>) :
                                            (<Alert icon={<Check fontSize="inherit" />} severity="success" sx={{mb: 2}}>
                                                Ce cadeau a été pris par <strong>{family?.members.find((v) => v.userUuid === privateData.takenBy)?.name}</strong>
                                            </Alert>))}
                                </Box>
                                <Box sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexWrap: "wrap",
                                }}>
                                    {privateData.takenBy === null &&
                                        <GiftAcceptButton
                                            gift={gift}
                                            onUpdated={updatePrivateData}
                                        />
                                    }
                                    {privateData.takenBy === user?.uuid &&
                                        <GiftDenyButton
                                            gift={gift}
                                            onUpdated={updatePrivateData}
                                        />
                                    }
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid size={{
                            xs: 12,
                            sm: 12,
                            md: 7
                        }}>
                            <Paper sx={{
                                padding: {xs: 1, md: 2},
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: 'column',
                                height: '100%',
                                zIndex: 2
                            }}>
                                <PrivateContentChat privateData={privateData} gift={gift} onAdd={updatePrivateData}/>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>}
        </>
    )
}