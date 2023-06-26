import React from "react";
import { useOutletContext, useParams } from "react-router-dom";

function Page() {
  const { id } = useParams();
  // const obj = useOutletContext();
  return <div>Page = {id}</div>;
}

export default Page;
