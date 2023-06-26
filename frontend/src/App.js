import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";

import Notfound from "./pages/Notfound";
import ChatRoom from "./pages/ChatRoom";
import Login from "./pages/Login";

function App() {
  const location = useLocation();

  return (
    <>
      <Routes>
        <Route path="/chatroom" element={<ChatRoom />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Notfound />} />
      </Routes>
    </>
  );
}

export default App;
