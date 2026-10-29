import Layout from "../components/Layout";
import {useEffect, useState} from "react";
import {useAuth} from "../provider/AuthProvider";
import axios from "axios";
import {Family} from "../types/models";
import {useNavigate} from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import {Home, CardGiftcard, People} from "@mui/icons-material";

type TakenGift = {
    uuid: string;
    title: string;
    content: string;
    additionalLinks?: string[];
    image?: string | null;
    type?: string;
    takenBy?: string;
    byUserUuid?: string;
    member?: {
        uuid: string;
        userUuid: string;
        name: string;
    };
    family?: {
        uuid: string;
        name: string;
    };
};

export default function Index() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [families, setFamilies] = useState<Family[] | null>(null);
    const [takenGifts, setTakenGifts] = useState<TakenGift[] | null>(null);
    const [loadingFamilies, setLoadingFamilies] = useState(true);
    const [loadingTaken, setLoadingTaken] = useState(true);

    useEffect(() => {
        setLoadingFamilies(true);
        axios.get("/family")
            .then(response => {
                setFamilies(Array.isArray(response.data) ? response.data : []);
            })
            .catch(() => {
                setFamilies([]);
            })
            .finally(() => {
                setLoadingFamilies(false);
            });
    }, [user?.uuid]);

    useEffect(() => {
        setLoadingTaken(true);
        axios.get("/user/taken-gifts")
            .then(response => {
                setTakenGifts(Array.isArray(response.data) ? response.data : []);
            })
            .catch((error) => {
                console.error("Impossible de charger les cadeaux à prendre :", error);
                setTakenGifts([]);
            })
            .finally(() => {
                setLoadingTaken(false);
            });
    }, [user?.uuid]);

    const goToFamily = (familyId: string) => {
        navigate(`/families/${familyId}`);
    };

    const goToGift = (gift: TakenGift) => {
        if (gift.family?.uuid && gift.member?.uuid) {
            navigate(`/families/${gift.family.uuid}/member/${gift.member.uuid}/gifts/${gift.uuid}`);
        } else if (gift.family?.uuid) {
            navigate(`/families/${gift.family.uuid}`);
        }
    };

    return (
        <Layout>
            <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: 2 }}>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Home fontSize="large" />
                            Accueil
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Bienvenue {user?.email ? user.email.split('@')[0] : ''} !
                        </Typography>
                    </Box>

                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <People />
                                Mes familles
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {loadingFamilies ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress size="2rem" />
                                </Box>
                            ) : families && families.length > 0 ? (
                                <Grid container spacing={2}>
                                    {families.map((family) => (
                                        <Grid item xs={12} sm={6} md={4} key={family.uuid}>
                                            <Button
                                                fullWidth
                                                variant="outlined"
                                                onClick={() => goToFamily(family.uuid)}
                                                sx={{
                                                    justifyContent: 'flex-start',
                                                    textAlign: 'left',
                                                    p: 2,
                                                    height: '100%'
                                                }}
                                            >
                                                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                        {family.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                                        <Typography variant="body1" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {family.name}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Button>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Vous n'appartenez à aucune famille pour le moment.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="h5" component="h2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CardGiftcard />
                                Mes cadeaux à prendre
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            {loadingTaken ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress size="2rem" />
                                </Box>
                            ) : takenGifts && takenGifts.length > 0 ? (
                                <List>
                                    {takenGifts.map((gift) => (
                                        <ListItem key={gift.uuid} disablePadding sx={{ mb: 1 }}>
                                            <ListItemButton onClick={() => goToGift(gift)} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                            {gift.title}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                                                            {gift.content && (
                                                                <Typography variant="body2" color="text.secondary" sx={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical'
                                                                }}>
                                                                    {gift.content}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption" color="text.secondary">
                                                                {gift.member?.name && gift.family?.name
                                                                    ? `Pour ${gift.member.name} • ${gift.family.name}`
                                                                    : gift.family?.name || ''}
                                                            </Typography>
                                                        </Stack>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Vous n'avez pas encore pris de cadeau à offrir.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Stack>
            </Box>
        </Layout>
    )
}