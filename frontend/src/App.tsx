import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Heading } from "./components/Header/Heading";
import { PlayerPage } from "./pages/Player/Player";
import { ProgressoPage } from "./pages/Progresso/Progresso";
import { ShadowingPage } from "./pages/Shadowing/Shadowing";
import { HomePage } from "./pages/Select/SelectPath";

import "./App.css";

export default function App() {
  return (
    <>
      <div className="app">
        <BrowserRouter>
          <Heading />
          <Routes>
            <Route path="/" element={<Navigate to="/selectpath" />} />
            <Route path="/selectpath" element={<HomePage />} />
            <Route path="/player" element={<PlayerPage />} />
            <Route path="/progresso" element={<ProgressoPage />} />
            <Route path="/shadowing" element={<ShadowingPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}
