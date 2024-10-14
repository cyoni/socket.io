// "use client"
// import React, { createContext, useContext, useEffect, useRef } from "react";
// import io from "socket.io-client";

// const SocketContext = createContext();

// export const useSocket = () => useContext(SocketContext);

// export const SocketProvider = ({ children }) => {
//   const socketRef = useRef();

//   useEffect(() => {
//     console.log("$$")
//     socketRef.current = io();

//     return () => {
//       console.log("socket dis")
//       socketRef.current.disconnect();
//     };
//   }, []);

//   console.log("socketRef.current",socketRef.current)
//   return (
//     <SocketContext.Provider value={socketRef.current}>
//       {children}
//     </SocketContext.Provider>
//   );
// };
