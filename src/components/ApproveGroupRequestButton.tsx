import axios from "axios";
import {styled} from "@mui/material/styles";
import {IconButton} from "@mui/material";
import {Check} from "@mui/icons-material";
import {useState} from "react";
import {GroupRequest} from "../types/models";

export default function ApproveGroupRequestButton (props: {request: GroupRequest, onSuccess: () => void}) {
    const [loading, setLoading] = useState(false);

    const acceptGroupRequest = async (request: GroupRequest) => {
        setLoading(true);
        await axios.post("/family/"+request.familyId+"/groups/requests/"+request.uuid+"/accept")
            .then(response => {
                props.onSuccess();
            })
        setLoading(false);
    }

    const AcceptButton = styled(IconButton)(({ theme }) => ({
        backgroundColor: theme.palette.success.main,
    }));

    return (
        <AcceptButton
            edge="end"
            aria-label="delete"
            color="success"
            loading={loading}
            onClick={async () => {
                await acceptGroupRequest(props.request)
            }}
        >
            {!loading && <Check />}
        </AcceptButton>
    );
}