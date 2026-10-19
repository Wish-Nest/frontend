import React from 'react';
import { Avatar, Card, CardHeader, CardContent, Stack, Typography, Box, Divider } from "@mui/material";
import { Lock, Person } from "@mui/icons-material";
import EditGift from "./EditGift";
import DeleteGift from "./DeleteGift";
import GiftPrivateContentPopup from "./private/GiftPrivateContentPopup";
import GiftLinks from './GiftLinks';
import { API_BASE_URL } from "../../env";

interface PrivateGiftCardProps {
    gift: any;
    privateData?: any;
    currentUserUuid?: string | undefined;
    family?: any;
    /**
     * Liste gérée : masque le bandeau « Ce cadeau est privé » (et le cadenas),
     * tout en gardant la personne qui propose le cadeau.
     */
    hidePrivateNotice?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onUpdatePrivate?: () => void;
}

export default function PrivateGiftCard({ gift, privateData, currentUserUuid, family, hidePrivateNotice, onEdit, onDelete, onUpdatePrivate }: PrivateGiftCardProps) {
    const taken = privateData && privateData?.[gift.uuid] && privateData[gift.uuid]?.takenBy !== null;

    function getFamilyMemberByUuid(uuid: string) {
        return family?.members?.find((v: any) => v.userUuid === uuid);
    }

    const proposer = getFamilyMemberByUuid(gift.byUserUuid);
    const proposerLabel = (gift.byUserUuid === currentUserUuid
        ? "Vous avez"
        : (proposer ? proposer.name + " a" : "Un inconnu a")) + " proposé ce cadeau";

    console.log(privateData);

    return (
        <Card sx={{ marginTop: '1rem' }} key={gift.uuid}  variant={
            taken ?
                (privateData[gift.uuid ?? ""]?.takenBy === currentUserUuid ?
                        'success' :
                        'warning'
                ) :
                'outlined'
        }>
            <CardHeader
                avatar={hidePrivateNotice ? (
                    <Avatar src={proposer?.image ? API_BASE_URL + proposer.image : undefined}>
                        <Person />
                    </Avatar>
                ) : <Lock />}
                title={hidePrivateNotice ? undefined : "Ce cadeau est privé"}
                subheader={proposerLabel}
                action={gift.byUserUuid === currentUserUuid ? <EditGift gift={gift} onEdit={onEdit} /> : null}
            />
            <CardContent>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                    <Typography variant="h5" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                        {gift.title}
                        {privateData && privateData[gift.uuid ?? ""]?.takenBy === currentUserUuid && (
                            <Typography variant="caption" color="success.main" sx={{ marginLeft: { xs: 0, sm: 1 }, marginBottom: { xs: 1, sm: 0 } }}>
                                (Vous avez pris ce cadeau)
                            </Typography>
                        )}
                        {privateData && privateData[gift.uuid ?? ""]?.takenBy && privateData[gift.uuid ?? ""]?.takenBy !== null && privateData[gift.uuid ?? ""]?.takenBy !== currentUserUuid && (
                            <Typography variant="caption" color="warning.main" sx={{ marginLeft: { xs: 0, sm: 1 }, marginBottom: { xs: 1, sm: 0 } }}>
                                (Ce cadeau a été pris par <strong>{getFamilyMemberByUuid(privateData[gift.uuid ?? ""]?.takenBy! ?? "un inconnu")?.name ?? "un inconnu"}</strong>)
                            </Typography>
                        )}
                    </Typography>
                </Stack>
                <Typography variant="body1">{gift.content}</Typography>

                {gift.image && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                        <img src={API_BASE_URL + gift.image} alt={gift.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }} />
                    </Box>
                )}

                { ( (gift.additionalLinks && gift.additionalLinks.length > 0) || (gift.additional_links && gift.additional_links.length > 0) ) && (
                    <Box sx={{ mt: 1 }}>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="subtitle2">Liens associés :</Typography>
                        <GiftLinks links={gift.additionalLinks ?? gift.additional_links ?? []} />
                    </Box>
                )}
            </CardContent>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: 'center' }}>
                <Stack direction="row" spacing={2}>
                    {gift.byUserUuid === currentUserUuid && <DeleteGift giftUuid={gift.uuid} onDelete={onDelete ?? (() => {})} />}
                    <GiftPrivateContentPopup gift={gift} privateData={privateData ? (privateData[gift.uuid] ?? { messages: [], takenBy: null }) : privateData} updatePrivateData={onUpdatePrivate ?? (() => {})} />
                </Stack>
            </Stack>
        </Card>
    );
}
