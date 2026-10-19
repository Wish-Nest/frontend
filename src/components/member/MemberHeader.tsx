import React from 'react';
import { Avatar, Box, Stack, Typography } from "@mui/material";
import AddSelfGift from "./AddSelfGift";
import AddPrivateGift from "./AddPrivateGift";
import RenameMemberButton from "./RenameMemberButton";
import {ImportContactsSharp} from "@mui/icons-material";
import {useFamily} from "../../provider/FamilyProvider";
import {API_BASE_URL} from "../../env";

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
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', marginBottom: { xs: '1rem', sm: 0 } }}>
                <Avatar
                    src={member.image ? API_BASE_URL + member.image : undefined}
                    sx={{width: 48, height: 48, marginRight: 1, display: {xs: 'none', md: 'inline-flex'}}}
                >
                    <ImportContactsSharp />
                </Avatar>
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
