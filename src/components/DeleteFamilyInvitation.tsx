import axios from "axios";
import {IconButton} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useState} from "react";
import {FamilyInvitation} from "../types/models";

export default function DeleteFamilyInvitation(props: {invitation: FamilyInvitation, onDelete: () => void}) {
    const [loading, setLoading] = useState(false);

    return (
        <IconButton
            edge="end"
            aria-label="Supprimer"
            loading={loading}
            onClick={() => {
                setLoading(true);
                axios.delete("/family/"+props.invitation.familyUuid + "/invitations/" + props.invitation.uuid)
                    .then(() => {
                        props.onDelete();
                    }).finally(() => setLoading(false));
            }}
        >
            {!loading && <Delete/>}
        </IconButton>
    );
}