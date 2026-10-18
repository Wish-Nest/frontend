import Button from "@mui/material/Button";
import {useState} from "react";
import GiftPopup from "./GiftPopup";
import axios from "axios";
import {useMemberSelected} from "../../provider/MemberSelectedProvider";
import {Lock} from "@mui/icons-material";

export default function AddPrivateGift({ onAdd }: {
    onAdd: () => void;
}){
    const [open, setOpen] = useState(false);
    const { member } = useMemberSelected();

    async function create(title: string, content: string, additionalLinks?: string[], image?: string | null) {
        try {
            await axios.post("/familymember/" + member?.uuid + "/gift/private", {
                title: title,
                content: content,
                additionalLinks: additionalLinks ?? [],
                image: image ?? null
            })
            onAdd();
        } catch (error) {
            console.error("Error creating gift:", error);
        }
    }

    return (
        <>
            <Button
                variant="contained"
                onClick={() => setOpen(true)}
                endIcon={<Lock/>}
            >
                Proposer un cadeau privé
            </Button>
            <GiftPopup
                content={null}
                title={null}
                initialLinks={[]}
                open={open}
                description={"Ce cadeau sera proposé à tout les membres ayant accès aux données privées de ce membre. Ils pourront alors choisir de le prendre ou non comme un cadeau normal."}
                setOpen={setOpen}
                onAdd={(title: string, content: string, additionalLinks?: string[], image?: string | null) => {
                    return create(title, content, additionalLinks, image);
                }}
            />
        </>
    );
}