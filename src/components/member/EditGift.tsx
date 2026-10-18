import { IconButton } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import GiftPopup from "./GiftPopup";
import { Edit } from "@mui/icons-material";
import {Gift} from "../../types/models";

export default function EditGift({ gift, onEdit }: {
    gift: Gift,
    onEdit?: () => void
}) {
    const [open, setOpen] = useState(false)

    async function edit(title: string, content: string, additionalLinks?: string[], image?: string | null) {
        try {
            await axios.put("/gift/" + gift.uuid, {
                title: title,
                content: content,
                additionalLinks: additionalLinks ?? [],
                image: image ?? null
            })
            if (onEdit) {
                onEdit();
            }
        } catch (error) {
            console.error("Error updating gift:", error);
        }
    }


    return (
        <>
            <IconButton 
                onClick={() => setOpen(true)}
            >
                <Edit/>
            </IconButton>
            <GiftPopup
                content={gift.content}
                title={gift.title}
                initialLinks={gift.additionalLinks ?? []}
                initialImage={gift.image ?? null}
                open={open}
                description={"Modifier le cadeau que vous avez proposé."}
                setOpen={setOpen}
                onAdd={(title: string, content: string, additionalLinks?: string[], image?: string | null) => {
                    return edit(title, content, additionalLinks, image);
                }}
            />
        </>
    );
}