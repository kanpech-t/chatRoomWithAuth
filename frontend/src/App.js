import "./App.css";
import { Link, Route, Routes, NavLink, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Page from "./pages/Page";
import Pagelist from "./pages/Pagelist";
import Newpage from "./pages/Newpage";
import Notfound from "./pages/Notfound";
import Nav from "./Nav";
import Pageroute from "./Pageroute";
import Miniprojectlist from "./pages/Miniprojectlist";
import ChatRoom from "./pages/ChatRoom";
import Login from "./pages/Login";

function App() {
  const location = useLocation();
  const defaultPage = ["/", "/miniproject"];

  return (
    <>
      {defaultPage.includes(location.pathname) && (
        <nav className="Nav_bar">
          {/* navlink จะมีคลาส active ให้ */}
          <li>
            <NavLink to="/">Home</NavLink>
          </li>
          <li>
            <NavLink to="/miniproject">Miniproject</NavLink>
          </li>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page/*" element={<Pageroute />} />
        <Route path="/miniproject" element={<Miniprojectlist />} />
        <Route path="/chatroom" element={<ChatRoom />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Notfound />} />
        {/* <Route path="/pagelist" element={<Pagelist />} />
        <Route path="/page/:id" element={<Page />} />
        <Route path="/page/newpage" element={<Newpage />} />
        <Route path="*" element={<Notfound />} /> */}
      </Routes>
    </>
  );
}

export default App;
