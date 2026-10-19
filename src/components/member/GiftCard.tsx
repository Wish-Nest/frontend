import React from 'react';
import { Card, CardContent, Stack, Typography, Box, Divider, Tooltip } from "@mui/material";
import EditGift from "./EditGift";
import DeleteGift from "./DeleteGift";
import GiftPrivateContentPopup from "./private/GiftPrivateContentPopup";
import GiftLinks from './GiftLinks';
import { API_BASE_URL } from "../../env";
import {data} from "react-router-dom";
import {_GiftPrivateData, Gift, PrivateData} from "../../types/models";
import {useMemberSelected} from "../../provider/MemberSelectedProvider";
import {useAuth} from "../../provider/AuthProvider";
import {useFamily} from "../../provider/FamilyProvider";

interface GiftCardProps {
    gift: Gift;
    giftPrivateData: _GiftPrivateData | false,
    onEdit?: () => void;
    onDelete?: () => void;
    onUpdatePrivate?: () => void;
    /** Poignée de glisser-déposer (rendue par le parent quand l'ordre est modifiable) */
    dragHandle?: React.ReactNode;
    /** Rang de priorité (1 = le plus souhaité). Absent si la liste n'a qu'un cadeau. */
    priority?: number;
}

export default function GiftCard({ gift, giftPrivateData, onEdit, onDelete, onUpdatePrivate, dragHandle, priority }: GiftCardProps) {
    const { member } = useMemberSelected();
    const { user } = useAuth();
    const { family } = useFamily();
    const giftOwnerIsMember = member && user && user.uuid === member.userUuid;
    const giftLocked = giftPrivateData === false;
    const giftTaken = giftPrivateData && giftPrivateData.takenBy !== null;
    const giftTakenByCurrentUser = giftTaken && giftPrivateData.takenBy === user?.uuid;
    const giftTakenByAnotherUser = giftTaken && giftPrivateData.takenBy !== user?.uuid;

    console.log(giftPrivateData);
    const additionnalLinks = gift.additionalLinks ?? gift.additional_links ?? [];

    function getFamilyMemberByUuid(uuid: string) {
        return family?.members?.find((v: any) => v.userUuid === uuid);
    }

    return (
        <Card sx={{ marginTop: '1rem' }} key={gift.uuid} variant={
            giftTaken ?
                (giftTakenByCurrentUser ?
                    'success' :
                    'warning'
                ) :
                'outlined'
        }>
            <CardContent sx={{ padding: 0, marginBottom: 1 }}>
                <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
                        {priority !== undefined && (
                            <Tooltip title={priority === 1 ? "Priorité 1 : le cadeau le plus souhaité" : `Priorité ${priority}`}>
                                <Box
                                    aria-label={`Priorité ${priority}`}
                                    sx={{
                                        minWidth: 30,
                                        height: 30,
                                        px: 0.5,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 700,
                                        fontSize: '0.85rem',
                                        backgroundColor: priority === 1 ? 'primary.main' : 'action.selected',
                                        color: priority === 1 ? 'primary.contrastText' : 'text.secondary'
                                    }}
                                >
                                    {priority}
                                </Box>
                            </Tooltip>
                        )}
                        <Typography variant="h5" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                            {gift.title}
                            {giftTakenByCurrentUser && (
                                <Typography variant="caption" color="success.main" sx={{ marginLeft: { xs: 0, sm: 1 }, marginBottom: { xs: 1, sm: 0 } }}>
                                    (Vous avez pris ce cadeau)
                                </Typography>
                            )}
                            {giftTakenByAnotherUser && (
                                <Typography variant="caption" color="warning.main" sx={{ marginLeft: { xs: 0, sm: 1 }, marginBottom: { xs: 1, sm: 0 } }}>
                                    (Ce cadeau a été pris par <strong>{getFamilyMemberByUuid(giftPrivateData.takenBy ?? "un inconnu")?.name ?? "un inconnu"}</strong>)
                                </Typography>
                            )}
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        {dragHandle}
                        {giftOwnerIsMember && <EditGift gift={gift} onEdit={onEdit} />}
                    </Stack>
                </Stack>
                <Typography variant="body1">{gift.content}</Typography>

                {gift.image && (
                    <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                        <img src={API_BASE_URL + gift.image} alt={gift.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }} />
                    </Box>
                )}

                { additionnalLinks.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="subtitle2">Liens associés :</Typography>
                        <GiftLinks links={additionnalLinks} />
                    </Box>
                )}
            </CardContent>
            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: 'center' }}>
                <Stack direction="row" spacing={2}>
                    {giftOwnerIsMember && <DeleteGift giftUuid={gift.uuid} onDelete={onDelete ?? (() => {})} />}
                    {!giftLocked && <GiftPrivateContentPopup
                        gift={gift}
                        privateData={giftPrivateData}
                        updatePrivateData={onUpdatePrivate ?? (() => {})} />}
                </Stack>
                {giftLocked &&  <Typography variant="body2" color="text.secondary">
                    {giftOwnerIsMember ?
                        "Vous ne pouvez pas accéder aux données privées de votre propre liste de souhaits" :
                        "Vous n'avez pas les droits pour accéder aux données privées de cette liste, attendez qu'un membre vous accepte"}
                </Typography>}
            </Stack>
        </Card>
    );
}
