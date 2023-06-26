import React from "react";
import { Link, Outlet } from "react-router-dom";

function Nav() {
  return (
    <>
      <Link to="/page/1">Page1</Link>
      <Link to="/page/2">Page2</Link>
      <Outlet context={{ hello: "world" }} />
    </>
  );
}

export default Nav;
