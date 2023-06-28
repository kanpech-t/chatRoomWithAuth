import React from "react";
import { useNavigate } from "react-router-dom";

function Notfound() {
  const navigate = useNavigate();
  setTimeout(() => {
    navigate("/login", { state: "not found" });
  }, 1000);
  return <div>Notfound</div>;
}

export default Notfound;
