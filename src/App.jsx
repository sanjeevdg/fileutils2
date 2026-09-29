import { useState } from "react";
import { Routes, Route } from "react-router-dom";

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

import "./App.css";



export default function App() {



/*

                        config={config}
                        context={context}
                        handlers={handlers}
                        */


const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app">

      <Header onMenuClick={() => setSidebarOpen(prev => !prev)}/>

      <div className="body">

        <Sidebar isOpen={sidebarOpen}/>

        <main className="content">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/file-reader" element={<FileReaderPage />} />
            <Route path="/about" element={<About />} />
            <Route
                path="/designer/:name"
                element={<Designer />}
            />
            <Route
                            path="/designer"
                            element={<Designer />}
                        />
           <Route
                path="/dashboard/:name"
                element={<Dashboard />}
            />
            <Route path="/testpicker" element={<TestPicker />} />
            <Route path="/userformrenderer" element={<UserFormRenderer />} />
            <Route path="/change-password" element={<PasswordPage />} />
            <Route path="/dashboard" element={<Dashboard />} />            
            <Route path="/loginrenderer" element={<LoginRenderer />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

        </main>

      </div>

    </div>
  );
}