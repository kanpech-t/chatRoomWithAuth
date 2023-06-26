import React from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";
import Newpage from "./pages/Newpage";
import Page from "./pages/Page";

function Pageroute() {
  const [searchParams, setSearchParams] = useSearchParams({ n: 3 });
  const number = searchParams.get("n");
  return (
    <>
      <div>{number}</div>
      <Routes>
        <Route path=":id" element={<Page />} />
        <Route path="newpage" element={<Newpage />} />
      </Routes>
      <input
        type="number"
        value={number}
        onChange={(e) => setSearchParams({ n: e.target.value })}
      />
    </>
  );
}

export default Pageroute;
