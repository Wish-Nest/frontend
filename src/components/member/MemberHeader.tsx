import React from 'react';
import { Box, Stack, Typography } from "@mui/material";
import AddSelfGift from "./AddSelfGift";
import AddPrivateGift from "./AddPrivateGift";
import RenameMemberButton from "./RenameMemberButton";
import {useFamily} from "../../provider/FamilyProvider";

interface MemberHeaderProps {
    member: any;
    currentUserUuid?: string | undefined;
    onAddSelf?: () => void;
    onAddPrivate?: () => void;
}

export default function MemberHeader({ member, currentUserUuid, onAddSelf, onAddPrivate }: MemberHeaderProps) {
    const { family, selectFamily } = useFamily();

    if (!member) return null;

    // On peut renommer son propre nom, ou un membre dont la liste est gérée par la famille.
    const canRename = member.userUuid === currentUserUuid || member.virtual === true;

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
        }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', marginBottom: { xs: '1rem', sm: 0 } }}>
                <Typography variant="h3">
                    {currentUserUuid === member.userUuid ?
                        "Votre liste de souhaits" :
                        "Liste de souhaits de " + member.name}
                </Typography>
            </Stack>
            {member.userUuid === currentUserUuid && <AddSelfGift onAdd={onAddSelf ?? (() => {})} />}
            {(member.userUuid !== currentUserUuid) && <AddPrivateGift onAdd={onAddPrivate ?? (() => {})} />}
        </Box>
    );
}
