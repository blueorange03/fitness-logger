import React, { useContext } from "react";
import AuthContext from "../context/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);
  return (
    <div className="card">
      <h2>Profile</h2>
      {user ? (
        <>
          <p>Name: {user.name}</p>
          <p>SRN: {user.srn}</p>
          <p>Branch: {user.branch}</p>
        </>
      ) : <p>Loading...</p>}
    </div>
  );
}
