import {useEffect, useRef, useState} from "react";
import {CircularProgress, TextField} from "@mui/material";
import Button from "@mui/material/Button";
import {_GiftPrivateData, Gift} from "../../../types/models";
import {useFamily} from "../../../provider/FamilyProvider";
import {useAuth} from "../../../provider/AuthProvider";
import MessageRight from "./MessageRight";
import MessageLeft from "./MessageLeft";
import { Send } from "@mui/icons-material";
import axios from "axios";
import {API_BASE_URL} from "../../../env";

export default function PrivateContentChat({gift, privateData, onAdd}: {
    gift: Gift,
    privateData: _GiftPrivateData,
    onAdd: (message: string) => void,
}) {
    const [message, setMessage] = useState<string|null>(null);
    const [loadingMessage, setLoadingMessage] = useState(false);
    const {family} = useFamily();
    const {user} = useAuth();
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [privateData.messages]);

    function sendMessage() {
        if(!message || message.trim() === ""){
            return;
        }
        setLoadingMessage(true);
        return axios.post("/gift/" + gift.uuid  + "/messages", { message })
            .then(() => {
                if (onAdd) {
                    onAdd(message);
                }
                setMessage("");
                setTimeout(scrollToBottom, 100);
            })
            .finally(() => {
                setLoadingMessage(false);
            })
    }

    return (<>
        <div ref={chatContainerRef} style={{
            padding: 2,
            width: '100%',
            height: "60vh",
            overflowY: 'auto'
        }}>
            {privateData.messages.map((message, index) => {
                const u = family?.members?.find((v) => v.userUuid === message.user_uuid);
                if(!u){
                    return;
                }

                const memberPhoto = u.image ? API_BASE_URL + u.image : undefined;

                if(u?.userUuid === user?.uuid){
                    return (
                        <MessageRight
                            key={index}
                            message={message.content}
                            timestamp={message.timestamp}
                            displayName={"Vous"}
                            photoURL={memberPhoto}
                        />
                    );
                }
                return (
                    <MessageLeft
                        key={index}
                        message={message.content}
                        timestamp={message.timestamp}
                        displayName={u.name}
                        photoURL={memberPhoto}
                    />
                );
            })}
        </div>
        <form style={{
            display: 'flex',
            justifyContent: 'center',
            width: '95%',
            gap: '1rem'
        }}  noValidate autoComplete="off"
              onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
              }}>
            <TextField
                id="message"
                sx={{
                    width: '100%'
                }}
                value={message}
                onChange={(e) => {
                    setMessage(e.target.value)
                } }
            />
            <Button variant="contained" color="primary"
                onClick={(e) => {
                    e.preventDefault();
                    sendMessage();
                }}
                disabled={loadingMessage}
            >
                {loadingMessage ? <CircularProgress/> : <Send />}
            </Button>
        </form>
    </>);
}