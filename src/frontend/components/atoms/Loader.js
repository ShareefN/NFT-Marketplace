import React from "react";
import { Spinner } from "react-bootstrap";

function Loader({ text }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Spinner animation="border" style={{ display: "flex" }} />
      <p className="mx-3 my-0">{text}</p>
    </div>
  );
}

export default Loader