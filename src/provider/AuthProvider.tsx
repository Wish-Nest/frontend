import axios from "axios";
import {Context, createContext, SetStateAction, useCallback, useContext, useEffect, useMemo, useState} from "react";

export type User = {
    uuid: string;
    email: string;
    verified: boolean;
    derived_key: string;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const AuthContext: Context<{
    token: string | null,
    user: User | null,
    setToken: ((newToken: SetStateAction<string | null>) => void),
    setUser: ((newUser: SetStateAction<User | null>) => void),
    validate: (() => void),
    logout: (() => void)
}> = createContext({
    token: null,
    user: null,
    setToken: () => {},
    setUser: () => {},
    validate: () => {},
    logout: () => {}
});

function redirectToLogin() {
    if(window.location.pathname !== "/login"){
        window.location.href = "/login";
    }
}

function redirectToConfirm() {
    if(window.location.pathname !== "/confirm" && window.location.pathname !== "/login" && window.location.pathname !== "/register"){
        window.location.href = "/confirm";
    }
}

function store(key: string, value: string): any {
    localStorage.setItem(key, value);
}

function get(key: string): any {
    return localStorage.getItem(key);
}

function remove(key: string): any {
    localStorage.removeItem(key);
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const AuthProvider = ({children}) => {
    // State to hold the authentication token
    const [token, setToken_] = useState(get("token"));
    const [user, setUser_] = useState(JSON.parse(get("user") ?? "null") as any|null);

    // Function to set the authentication token
    const setToken = (newToken: SetStateAction<string | null>): void => {
        setToken_(newToken);
    };

    const setUser = (newUser: SetStateAction<User | null>): void => {
        setUser_(newUser);
    }

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        redirectToLogin();
    }, []);

    const validate = useCallback(() => {
        setUser((user) => {
            if(!user){
                return null;
            }
            user.verified = true;

            store('user', JSON.stringify(user));
            return user;
        });
    }, []);

    useEffect(() => {
        if (token) {
            console.log("Setting token");
            axios.defaults.headers.common["Authorization"] = "Bearer " + token;
            axios.defaults.headers.delete["Authorization"] = "Bearer " + token;
            store('token', token);
        } else {
            console.log("Deleting token");
            delete axios.defaults.headers.common["Authorization"];
            delete axios.defaults.headers.delete["Authorization"];
            remove('token')
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            console.log("Setting user");
            if(!user.verified){
                redirectToConfirm();
            }
            store('user', JSON.stringify(user));
        } else {
            console.log("Deleting user");
            remove('user')
        }
    });

    // Memoized value of the authentication context
    const contextValue = useMemo(
        () => ({
            token,
            user,
            setToken,
            setUser,
            logout,
            validate
        }),
        [token, user, logout, validate]
    );

    // Provide the authentication context to the children components
    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status ===  401 && !error.config?.url?.includes("/push/subscribe")) {
            remove("token");
            remove("user");
            redirectToLogin();
        }
        return Promise.reject(error);
    }
);

if(!localStorage.getItem("token") || !localStorage.getItem("user")){
    redirectToLogin();
}

export default AuthProvider;