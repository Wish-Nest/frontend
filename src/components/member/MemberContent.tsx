import {Alert, Box, Card, CardContent, LinearProgress} from "@mui/material";
import Typography from "@mui/material/Typography";
import {useAuth} from "../../provider/AuthProvider";
import {useMemberSelected} from "../../provider/MemberSelectedProvider";
import {useGift} from "../../provider/GiftProvider";
import {useFamily} from "../../provider/FamilyProvider";
import MemberHeader from './MemberHeader';
import MemberGifts from './MemberGifts';

export default function MemberContent() {
    const { user } = useAuth();
    const { privateData, member, fetchPrivateData } = useMemberSelected();
    const { gifts, refreshGifts } = useGift();
    const { family } = useFamily();

    function refreshPrivateData() {
        if(member !== null) {
            fetchPrivateData(member);
        }
    }

    function getFamilyMemberByUuid(uuid: string) {
        return family?.members?.find((v) => v.userUuid === uuid);
    }

    return (<Card sx={{
        padding: 0,
        paddingBottom: 2
    }}>
        <CardContent>
            {member === null && <Typography gutterBottom sx={{ color: 'text.secondary' }}>
                Veuillez choisir un membre de la famille dans la liste
            </Typography>}
            {member !== null && <>
                <MemberHeader member={member} currentUserUuid={user?.uuid} onAddSelf={refreshGifts} onAddPrivate={refreshPrivateData} />

                <MemberGifts
                    gifts={gifts}
                    privateData={privateData}
                    member={member}
                    family={family}
                    currentUserUuid={user?.uuid}
                    fetchPrivateData={fetchPrivateData}
                    refreshGifts={refreshGifts}
                />
            </>}
        </CardContent>
    </Card>)
}