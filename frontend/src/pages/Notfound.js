import React from "react";
import { useNavigate } from "react-router-dom";

function Notfound() {
  const navigate = useNavigate();
  setTimeout(() => {
    navigate(-1, { state: "not found" });
  }, 1000);
  return <div>Notfound</div>;
}

export default Notfound;
