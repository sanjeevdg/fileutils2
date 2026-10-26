
import { useState } from "react";
import {
    Routes,
    Route,
    useLocation,
    matchPath,
} from "react-router-dom";


import Home from "./pages/Home";
import FileReaderPage from "./pages/FileReaderPage";
import About from "./pages/About";
import Settings from "./pages/Settings";
import UserFormRenderer from './pages/UserFormRenderer';
import Dashboard from './pages/Dashboard';
import LoginRenderer from './pages/LoginRenderer'
import TestPicker from './pages/TestPicker';
import PasswordPage from './pages/PasswordPage';
import Designer from './designer/Designer';
import ProtectedRoute from "./components/ProtectedRoute";



import routeConfig from "./config/routeConfig";

//import routeConfig from "./config/routeConfig";

import "./App.css";

export default function App() {
    
    const location = useLocation();

    // Find the configuration for the current route.
    const currentRoute = routeConfig.find(route =>
        matchPath(
            {
                path: route.path,
                end: true,
            },
            location.pathname
        )
    );

    // One check determines which layout to display.
    const layout = currentRoute?.layout ?? "none";
    console.log('mylayout===',layout);
    const showAdminLayout = layout === "admin";
   

    return (
         <div className="app">

        
        <div className="body">

           
                <main className="content">
                    <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/file-reader" element={<FileReaderPage />} />
            <Route path="/about" element={<About />} />
            <Route
                path="/designer/:name"
                element={<ProtectedRoute><Designer /></ProtectedRoute>}
            />
            <Route
                            path="/designer"
                            element={<Designer />}
                        />
           <Route
                path="/dashboard/:name"
                element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route path="/testpicker" element={<TestPicker />} />
            <Route path="/userformrenderer" element={<UserFormRenderer />} />
            <Route path="/change-password" element={<PasswordPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />            
            <Route path="/loginrenderer" element={<LoginRenderer />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
                </main>

            </div>
        </div>
    );
}

