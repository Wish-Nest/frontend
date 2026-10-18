import {createContext, ReactNode, useContext, useState} from "react";
import { PrivateData, UserFamily} from "../types/models";
import axios from "axios";
import {useFamily} from "./FamilyProvider";
import {useAuth} from "./AuthProvider";
import {useNavigate} from "react-router-dom";

const MemberSelectedContext = createContext<{
    member: UserFamily | null;
    privateData: PrivateData | null | false;
    selectMember: (member: UserFamily, changeUrl: boolean) => void;
    fetchPrivateData: (member: UserFamily) => void;
}>({
    member: null,
    privateData: null,
    selectMember: () => {},
    fetchPrivateData: async (member: UserFamily) => {}
});

export const MemberSelectedProvider = ({children}: {children: ReactNode}) => {
    const [member, setMember] = useState<UserFamily | null>(null);
    const [privateData, setPrivateData] = useState<PrivateData | null | false>(null);
    const { family } = useFamily();
    const { user } = useAuth();
    const navigate = useNavigate();

    async function fetchPrivateData(member: UserFamily) {
        try {
            if (member.userUuid === user?.uuid) {
                setPrivateData(false);
                return;
            }

            setPrivateData(null);
            const response = await axios.get("/family/" + family?.uuid + "/member/" + member?.userUuid + "/privatedata");
            setPrivateData(response.data);
        } catch (error) {
            setPrivateData(false);
        }
    }

    const selectMember = (member: UserFamily, changeUrl: boolean) => {
        setMember(member);
        fetchPrivateData(member);
        if(changeUrl) {
            navigate(`/families/${family?.uuid}/member/${member?.uuid}`);
        }
    }

    return (
        <MemberSelectedContext.Provider value={{ member, privateData, selectMember, fetchPrivateData }}>
            {children}
        </MemberSelectedContext.Provider>
    );

}

export const useMemberSelected = () => useContext(MemberSelectedContext);