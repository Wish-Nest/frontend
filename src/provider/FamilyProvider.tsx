import {createContext, ReactNode, useContext, useState} from "react";
import {UserFamily} from "../types/models";
import axios from "axios";
import {useAuth} from "./AuthProvider";

interface Family {
    uuid: string;
    name: string;
    members: UserFamily[];
}

const FamilyContext = createContext<{
    family: Family | null;
    selectFamily: (familyId: string) => void;
}>({
    family: null,
    selectFamily: () => {}
});

export const FamilyProvider = ({children}: {children: ReactNode}) => {
    const [family, setFamily] = useState<Family | null>(null);
    const { user } = useAuth();

    const selectFamily = (familyId: string) => {
        axios.get("/family/" + familyId)
            .then(response => {
                setFamily(response.data);

                const currentUser = response.data.members.find((m: {uuid: string}) => m.uuid === user?.uuid);
                if(currentUser) {
                    const members = response.data.members;
                    members.splice(members.findIndex((m: {uuid: string}) => m.uuid === currentUser.uuid), 1);
                    members.unshift(currentUser);
                    setFamily({...response.data, members});
                }
            });
    }

    return (
        <FamilyContext.Provider value={{ family, selectFamily }}>
            {children}
        </FamilyContext.Provider>
    );

}

export const useFamily = () => useContext(FamilyContext);