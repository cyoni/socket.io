"use client";
import { useContext, useEffect, useState } from "react";
import { joinLobby } from "../actions/joinLobby";
import { useRouter } from "next/navigation";
import { UserContext } from "../context/UserContext";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { session, createSession } = useContext(UserContext);

  const enterLobby = async (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
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
    <div className="grid place-items-center min-h-screen">
      <form onSubmit={enterLobby} className="translate-y-[-50%]">
        <div>Enter your name:</div>
        <input
          className="text-black outline-0 p-2 px-4 text-lg rounded-lg font-semibold"
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          className="ml-2 p-2 px-6 shadow-md rounded-md block mt-2 bg-gradient-to-tr from-blue-700 via-sky-500 active:scale-90 transition "
        >
          Enter
        </button>
      </form>
    </div>
  );
}
