"use client";
import React, { createContext, useEffect, useState } from "react";
import verifyToken from "../lib/verifyToken";

export const UserContext = createContext({});
function UserContextProvider({ children }) {
  const [session, setSession] = useState();

  const createSession = (session) => {
    setSession(session);
  };

  useEffect(() => {
    const token = sessionStorage.getItem("session");
    console.log("got session", token);
    if (token) {
      verifyToken(token).then((res) => {
        console.log("res", res);
        setSession({ ...res, token });
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ session, createSession }}>
      {children}
    </UserContext.Provider>
  );
}

export default UserContextProvider;
