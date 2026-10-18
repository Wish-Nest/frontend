import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {Family} from "../../types/models";
import {useAuth} from "../../provider/AuthProvider";
import FamilySideContent from "./FamilySideContent";
import FamilyInvitationsSideContent from "./FamilyInvitationsSideContent";

export default function MenuContent({onClick}: {onClick: () => void}) {
    const [families, setFamilies] = useState<Family[]|null>(null);
    const { user } = useAuth();

    function fetchFamilies() {
        setFamilies(null);
        axios.get("/family")
            .then(response => {
                // Garde anti-crash : si /api renvoie du HTML (fallback nginx) ou
                // un objet d'erreur en 2xx, response.data n'est pas un tableau.
                setFamilies(Array.isArray(response.data) ? response.data : []);
            }).catch(() => {
                setFamilies([]);
            });
    }

    useEffect(() => {
        fetchFamilies();
    }, [user?.uuid]);

    return (
        <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
            <Stack>
                <FamilySideContent onClick={onClick} families={families} updateFamilies={fetchFamilies}/>
                <FamilyInvitationsSideContent refreshFamilies={fetchFamilies}/>
            </Stack>
        </Stack>
    );
}