import { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

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
import "./App.css";



export default function App() {



const [sidebarOpen, setSidebarOpen] = useState(true);



const location = useLocation();

const isLoginPage =
    location.pathname === "/dashboard/user_login";

const isSignupPage =
    location.pathname === "/dashboard/user_signup";


const isNewFrontendDashboard =
    location.pathname === "/dashboard/new_frontend";





  return (
     <div className="app">

        {!(isLoginPage || isSignupPage || isNewFrontendDashboard) && (
            <Header
                onMenuClick={() => setSidebarOpen(prev => !prev)}
            />
        )}

        <div className="body">

            {!(isLoginPage || isSignupPage || isNewFrontendDashboard) && (
                <Sidebar isOpen={sidebarOpen} />
            )}

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