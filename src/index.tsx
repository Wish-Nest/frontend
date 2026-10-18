import React, {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import {createBrowserRouter, createRoutesFromElements, Route, RouterProvider} from "react-router-dom";
import SignIn from "./pages/SignIn";
import axios from "axios";
import AppTheme from "./theme/AppTheme";
import {CssBaseline} from "@mui/material";
import AxiosProvider from "./provider/AxiosProvider";
import AuthProvider from "./provider/AuthProvider";
import Register from "./pages/Register";
import Index from "./pages/Index";
import {ProtectedRoute} from "./components/ProtectedRoute";
import FamilyIndex from "./pages/FamilyIndex";
import Confirm from "./pages/Confirm";
import RouteError from "./components/RouteError";
import { initPWA } from './pwa/initPWA';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path={"/"} errorElement={<RouteError/>}>
            <Route index element={<ProtectedRoute element={<Index/>}/>}/>
            <Route path={"families/:familyId/member/:memberId/gifts/:giftUuid"} element={<ProtectedRoute element={<FamilyIndex/>}/>}/>
            <Route path={"families/:familyId/member/:memberId"} element={<ProtectedRoute element={<FamilyIndex/>}/>}/>
            <Route path={"families/:familyId"} element={<ProtectedRoute element={<FamilyIndex/>}/>}/>
            <Route path={"login"} element={<SignIn/>}/>
            <Route path={"confirm"} element={<ProtectedRoute element={<Confirm/>}/>}/>
            <Route path={"register"} element={<Register/>}/>
        </Route>
    )
)

const token = localStorage.getItem("token");
const derivedKey = localStorage.getItem("derivedKey");

if (token) {
    axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}
if (derivedKey) {
    axios.defaults.headers.common["derivedKey"] = derivedKey;
}


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AppTheme>
            <CssBaseline enableColorScheme />
            <AxiosProvider/>
            <AuthProvider>
                <RouterProvider router={router}/>
            </AuthProvider>
        </AppTheme>
    </StrictMode>,
)


// Enregistrement du Service Worker + initialisation PWA/Push
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        initPWA('/sw.js').catch(console.warn);
    });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
