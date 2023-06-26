import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import Notfound from "./pages/Notfound";
import ChatRoom from "./pages/ChatRoom";
import LoginRegister from "./pages/LoginRegister";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginRegister />} />
        <Route path="/chatroom" element={<ChatRoom />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
}

export default App;
