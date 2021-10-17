import './App.css';
import DrawingArea from './components/canvas/DrawingArea';
import BrushSelector from './components/canvas/BrushSelector';
import { useEffect, createContext, useState } from 'react';
import 'bulma/css/bulma.min.css';
import socketClient from "socket.io-client";
import WelcomeModal from './components/WelcomeModal';
import RoomInfo from './components/RoomInfo';
import MouseCursor from './components/MouseCursor';

export const UserContext = createContext();

function App() {
  const [nickname, setNickname] = useState("");
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState();
  const [mousepos, setMousepos] = useState({ x: 0, y: 0 });

  let connectedAlready = false;

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (socket)
        socket.emit("mouse pos", mousepos);
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [mousepos]);

  function connect() {
    if (connectedAlready === false) {

      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
  
      let _socket; // May not be connected
      if (params.join) {
        _socket = socketClient('http://localhost:3000', { query: { join : params.join.trim(), nickname }});
      } else {
        _socket = socketClient('http://localhost:3000', { query: { nickname }});
      }
      _socket.on("draw", "draw event");

      _socket.on("room joined", (msg) => {
        console.log("Joined ", msg);
        setRoom(msg);
      });
  
      _socket.on("connect", (msg) => {
        connectedAlready = true;
        setSocket(_socket);
      });
    }
  }

  return (
    <UserContext.Provider value={{
      nickname,
      setNickname,
      room,
      setRoom,
      socket,
      connect
    }}>
      <WelcomeModal/>
      <RoomInfo/>
      <MouseCursor/>
      <div onMouseMove={(e) => { setMousepos({ x: e.pageX, y: e.pageY }); }}>
        <DrawingArea></DrawingArea>
      </div>
      <BrushSelector></BrushSelector>
    </UserContext.Provider>
  );
}

export default App;
