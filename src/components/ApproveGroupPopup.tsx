import {useEffect, useState} from "react";
import axios from "axios";
import {Card, CardContent, Grid, ListItemAvatar} from "@mui/material";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Avatar from "@mui/material/Avatar";
import {ImportContactsSharp} from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import Box from "@mui/material/Box";
import {useAuth} from "../provider/AuthProvider";
import {useFamily} from "../provider/FamilyProvider";
import ApproveGroupRequestButton from "./ApproveGroupRequestButton";
import {GroupRequest} from "../types/models";
import {API_BASE_URL} from "../env";

export default function ApproveGroupPopup(props: {familyId: string}) {
    const [ requestsToApprove, setRequestsToApprove ] = useState<GroupRequest[]>([]);
    const { user } = useAuth();
    const { family } = useFamily();

    useEffect(() => {
        axios.get("/family/" + props.familyId + "/groups/requests")
            .then(response => {
                setRequestsToApprove(response.data);
            });
    }, [props.familyId, user?.uuid]);

    return requestsToApprove.length !== 0 && (
        <Grid container>
            <Grid size={12}>
                <Card sx={{
                    padding: 0
                }} className="MuiCard-error">
                    <CardContent>
                        <Typography gutterBottom>
                            Vous avez des demandes d'adhésion à approuver
                        </Typography>
                        <Typography  sx={{ color: 'text.secondary' }}>
                            Cette demandes surviennent lorsqu'un membre rejoint une famille. Il a besoin de l'approbation d'un membre de chaque groupe de la famille pour avoir accès aux données privées.
                        </Typography>
                        <List sx={{
                            padding: 0
                        }}>
                            {requestsToApprove.map((request, index) => {
                                const originMember = family?.members?.find(m => m.userUuid === request.originUuid);
                                return (<ListItem key={index} sx={{
                                        padding: {xs: '0.5rem'}
                                    }}>
                                        <ListItemAvatar>
                                            <Avatar src={originMember?.image ? API_BASE_URL + originMember.image : undefined}>
                                                <ImportContactsSharp />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            sx={{
                                                flexGrow: 0
                                            }}
                                            primary={request.originName}
                                            secondary={"Souhaite rejoindre le groupe dédié à : " + request.targetName}
                                        />
                                        <Box sx={{marginLeft: '1rem'}}></Box>
                                        <ApproveGroupRequestButton request={request} onSuccess={() => {
                                            setRequestsToApprove(requestsToApprove.filter(r => r.groupUuid !== request.groupUuid));
                                        }}/>
                                    </ListItem>
                                )})}
                        </List>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    ) || <></>;
}