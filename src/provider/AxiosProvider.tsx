import axios, { Axios } from "axios";
import { Context, createContext } from "react";
import { API_BASE_URL } from "../env";

const AxiosContext: Context<Axios> = createContext<Axios>(null as unknown as Axios);

const AxiosProvider = () => {
    axios.defaults.baseURL = API_BASE_URL;

    return (<AxiosContext.Provider value={null as unknown as Axios}></AxiosContext.Provider>);
}

export default AxiosProvider;