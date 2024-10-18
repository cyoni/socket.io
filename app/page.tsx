"use client";
import { useContext, useEffect, useState } from "react";
import { joinLobby } from "../actions/joinLobby";
import { useRouter } from "next/navigation";
import { UserContext } from "../context/UserContext";


export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { session, createSession } = useContext(UserContext);


  const enterLobby = async () => {
    if (!name) return;

    const response = await joinLobby(name);
    if (response.status === "success") {
      const { name, token } = response;

      sessionStorage.setItem("session", token);
      createSession({ name, token });
    }
    console.log({ response });
  };

  useEffect(() => {
    console.log({ session });
    if (session) {
      router.push("/lobby");
    }
  }, [session]);


  return (
    <div>
      <label>Enter your name:</label>
      <input
        className="text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={enterLobby} className="border ml-2">
        Enter
      </button>
    </div>
  );
}
