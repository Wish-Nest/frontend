import { Navigate } from "react-router-dom";
import { useAuth } from "../provider/AuthProvider";
import {ReactElement} from "react";
import {FamilyProvider} from "../provider/FamilyProvider";
import {MemberSelectedProvider} from "../provider/MemberSelectedProvider";
import {GiftProvider} from "../provider/GiftProvider";

export const ProtectedRoute = ({element}: {element: ReactElement}) => {
    const { token } = useAuth();

    if (!token) {
        return <Navigate to="/login" />;
    }

    return (
        <FamilyProvider>
            <MemberSelectedProvider>
                <GiftProvider>
                    {element}
                </GiftProvider>
            </MemberSelectedProvider>
        </FamilyProvider>
    )
};