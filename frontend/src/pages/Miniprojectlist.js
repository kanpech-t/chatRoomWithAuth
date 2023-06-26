import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Miniprojectlist() {
  const projectName = ["chatroom", "login", "3"];

  const navigate = useNavigate();

  return (
    <>
      <div className="flex bg-slate-500 flex-wrap p-[24px] gap-[20px] justify-between">
        {projectName.map((name, index) => (
          <div
            key={index}
            onClick={() => {
              navigate(`/${name}`);
            }}
            className="w-[400px] h-[300px] bg-amber-100 flex justify-center items-center cursor-pointer"
          >
            {name}
          </div>
        ))}
      </div>
    </>
  );
}

export default Miniprojectlist;
