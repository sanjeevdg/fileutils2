import { Routes, Route } from "react-router-dom";

import Header from "./layout/Header";
import Sidebar from "./layout/Sidebar";

import Home from "./pages/Home";
import FileReaderPage from "./pages/FileReaderPage";
import About from "./pages/About";
import Settings from "./pages/Settings";
import FormRenderer from './pages/FormRenderer';

import "./App.css";

export default function App() {
  return (
    <div className="app">

      <Header />

      <div className="body">

        <Sidebar />

        <main className="content">

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/file-reader" element={<FileReaderPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/formrenderer" element={<FormRenderer />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>

        </main>

      </div>

    </div>
  );
}