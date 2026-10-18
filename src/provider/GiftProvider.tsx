import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {Gift, UserFamily} from "../types/models";
import axios from "axios";
import {useMemberSelected} from "./MemberSelectedProvider";

const GiftContext = createContext<{
    gifts: Gift[];
    refreshGifts: () => void;
}>({
    gifts: [],
    refreshGifts: () => {}
});

export const GiftProvider = ({children}: {children: ReactNode}) => {
    const { member } = useMemberSelected();
    const [gifts, setGifts] = useState<Gift[]>([]);

    async function fetchGifts(member: UserFamily) {
        try {
            setGifts([]);
            const response = await axios.get("/familymember/" + member?.uuid + "/gift");
            setGifts(response.data);
        } catch (error) {
            setGifts([]);
        }
    }

    const refreshGifts = () => {
        if (member !== null) {
            fetchGifts(member);
        }
    };

    useEffect(() => {
        if (member !== null) {
            fetchGifts(member);
        } else {
            setGifts([]);
        }
    }, [member]);

    return (
        <GiftContext.Provider value={{ gifts, refreshGifts }}>
            {children}
        </GiftContext.Provider>
    );

}

export const useGift = () => useContext(GiftContext);