import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Heading } from "./components/Header/Heading";
import { PlayerPage } from "./pages/Player/Player";
import { ProgressoPage } from "./pages/Progresso/Progresso";
import { ShadowingPage } from "./pages/Shadowing/Shadowing";
import { HomePage } from "./pages/Select/SelectPath";
import { HomePage as Home } from "./pages/Home/HomePage";
import { TranscodeTestPage } from "./pages/TranscodeTest/TranscodeTest";
import { PlayerSessionProvider } from "./contexts/PlayerSessionContext";

import "./App.css";

export default function App() {
  return (
    <>
      <div className="app">
        <PlayerSessionProvider>
          <BrowserRouter>
            <Heading />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/selectpath" element={<HomePage />} />
              <Route path="/player" element={<PlayerPage />} />
              <Route path="/progresso" element={<ProgressoPage />} />
              <Route path="/shadowing" element={<ShadowingPage />} />
              <Route path="/transcode-test" element={<TranscodeTestPage />} />
            </Routes>
          </BrowserRouter>
        </PlayerSessionProvider>
      </div>
    </>
  );
}
