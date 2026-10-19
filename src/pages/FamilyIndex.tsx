import {useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import axios from "axios";
import Stack from "@mui/material/Stack";
import {Box, Card, CardContent, Chip, CircularProgress, Grid, ListItemAvatar} from "@mui/material";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import {ImportContactsSharp} from "@mui/icons-material";
import {styled} from "@mui/material/styles";
import {FamilyInvitation} from "../types/models";
import {useAuth} from "../provider/AuthProvider";
import Layout from "../components/Layout";
import InviteFamilyButton from "../components/InviteFamilyButton";
import FamilyInvitations from "../components/FamilyInvitations";
import ApproveGroupPopup from "../components/ApproveGroupPopup";
import MemberContent from "../components/member/MemberContent";
import {useFamily} from "../provider/FamilyProvider";
import {useMemberSelected} from "../provider/MemberSelectedProvider";
import AddVirtualMemberButton from "../components/AddVirtualMemberButton";
import RenameMemberButton from "../components/member/RenameMemberButton";
import {API_BASE_URL} from "../env";

export default function FamilyIndex() {
    const { familyId, memberId } = useParams();
    const { family, selectFamily } = useFamily();
    const [ invitations, setInvitations ] = useState<FamilyInvitation[]|null>(null);
    const { user } = useAuth();
    const { selectMember, member } = useMemberSelected();

    if(familyId) {
        if(family === null || family.uuid !== familyId) {
            selectFamily(familyId);
        }
    }

    useEffect(() => {
        if(family === null) {
            return;
        }
        const currentUser = family.members.find((m: {uuid: string}) => m.uuid === user?.uuid);
        if(currentUser) {
            selectMember(currentUser, true);
        }
    }, [family, user]);

    useEffect(() => {
        if(memberId && family){
            const selectedMember = family.members.find((m: {uuid: string}) => m.uuid === memberId);
            if(selectedMember) {
                selectMember(selectedMember, false);
                return;
            }
        }else if(family && user){
            const currentUser = family.members.find((m: {uuid: string}) => m.userUuid === user?.uuid);
            if(currentUser) {
                selectMember(currentUser, false);
                return;
            }
        }
    }, [family, memberId, user]);

    async function updateInvitations() {
        if(family === null) {
            return;
        }
        await axios.get("/family/"+(family?.uuid ?? "")+"/invitations")
            .then((response) => {
                setInvitations(response.data);
            });
    }


    useEffect(() => {
        updateInvitations();
    }, [family]);


    const FamilyListItem = styled(ListItem)(({ theme }) => ({
        "&:hover": {
            backgroundColor: theme.palette.action.hover,
            cursor: "pointer"
        },
        borderRadius: theme.shape.borderRadius
    }));

    // On peut renommer son propre nom, ou un membre dont la liste est gérée par la famille.
    const canRenameMember = (m: {userUuid: string, virtual: boolean}) =>
        m.userUuid === user?.uuid || m.virtual === true;

    return (
        <Layout>
            {family === null && <Stack sx={{mt: '2rem'}}>
                <CircularProgress size="4rem"/>
            </Stack>}
            {family !== null && <Stack>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{
                        alignItems: { xs: "flex-start", sm: "center" },
                        marginBottom: '2rem',
                        marginTop: '2rem'
                    }}>
                    <h1>Famille {family?.name}</h1>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ marginLeft: 'auto' }}
                    >
                        <InviteFamilyButton familyId={familyId ?? ""} onInvite={() => {
                            setInvitations(null);
                            updateInvitations();
                        }}></InviteFamilyButton>
                        <AddVirtualMemberButton familyId={familyId ?? ""} onAdded={() => {
                            if (familyId) {
                                selectFamily(familyId);
                            }
                        }} />
                    </Stack>
                </Stack>

                <Grid container spacing={2}>
                    <Grid item size={12}>
                        {familyId && <ApproveGroupPopup familyId={familyId}/>}
                    </Grid>
                    <Grid item size={{
                        xs: 12,
                        md: 3
                    }}>
                        <Stack spacing={2}>
                            <Card sx={{
                                padding: 0
                            }}>
                                <CardContent>
                                    <Typography gutterBottom sx={{ color: 'text.secondary' }}>
                                        Membres de la famille
                                    </Typography>
                                    <List>
                                        {(family?.members ?? []).map((m, index) => (
                                            <FamilyListItem onClick={() => selectMember(m, true)} sx={{
                                                backgroundColor: m.uuid === member?.uuid ? 'hsla(220, 20%, 35%, 0.3)' : 'inherit'
                                            }} key={index}>
                                                <ListItemAvatar>
                                                    <Avatar src={m.image ? API_BASE_URL + m.image : undefined}>
                                                        <ImportContactsSharp />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={m.name}
                                                />
                                                {/* Mobile (< md) : les badges sont réduits à un point    */}
                                                {/* de la même couleur pour ne pas écraser la ligne membre. */}
                                                {m.userUuid === user?.uuid && (
                                                    <>
                                                        <Chip label="Vous" color="success" variant="outlined"
                                                             sx={{display: {xs: 'none', md: 'inline-flex'}}}/>
                                                        <Box title="Vous" aria-label="Vous" sx={{
                                                            display: {xs: 'block', md: 'none'},
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                            backgroundColor: 'success.main',
                                                            flexShrink: 0,
                                                            alignSelf: 'center',
                                                            mr: 0.75,
                                                        }}/>
                                                    </>
                                                )}
                                                {m.virtual && (
                                                    <>
                                                        <Chip label="Liste gérée" title="Les souhaits de ce membre sont suivis par un membre de la famille" color="secondary" variant="outlined"
                                                             sx={{display: {xs: 'none', md: 'inline-flex'}}}/>
                                                        <Box
                                                            title="Les souhaits de ce membre sont suivis par un membre de la famille"
                                                            aria-label="Liste gérée"
                                                            sx={{
                                                                display: {xs: 'block', md: 'none'},
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                backgroundColor: 'secondary.main',
                                                                flexShrink: 0,
                                                                alignSelf: 'center',
                                                                mr: 0.75,
                                                            }}/>
                                                    </>
                                                )}
                                                <Stack sx={{ marginLeft: '0.5rem' }}></Stack>
                                                {canRenameMember(m) && <RenameMemberButton
                                                    member={m}
                                                    onRenamed={() => {
                                                        if (familyId) {
                                                            selectFamily(familyId);
                                                        }
                                                    }}
                                                />}
                                            </FamilyListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                            {(invitations !== null && invitations.length > 0) && <FamilyInvitations invitations={invitations} onRemove={(uuid: string) => {
                                setInvitations(invitations?.filter(i => i.uuid !== uuid) ?? null);
                            }}/>}
                        </Stack>
                    </Grid>
                    <Grid item size={{
                        xs: 12,
                        md: 9
                    }}>
                            <MemberContent/>
                    </Grid>
                 </Grid>
            </Stack>}
        </Layout>
    )
}