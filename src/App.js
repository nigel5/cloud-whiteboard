import './App.css';
import DrawingArea from './components/canvas/DrawingArea';
import BrushSelector from './components/canvas/BrushSelector';
import { useEffect, createContext, useState } from 'react';
import 'bulma/css/bulma.min.css';
import socketClient from "socket.io-client";
import WelcomeModal from './components/WelcomeModal';
import RoomInfo from './components/RoomInfo';
import MouseCursor from './components/MouseCursor';
import { CanvasProvider } from './components/canvas/CanvasContext';
import { randomHexColor } from './util/random';
import { v4 as uuidv4 }  from "uuid";

export const UserContext = createContext();

function App() {
  const [nickname, setNickname] = useState("");
  const [cursorColor, setCursorColor] = useState("#000000");
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState();
  const [mousepos, setMousepos] = useState({ x: 0, y: 0 });

  const [mouseCursors, setMouseCursors] = useState([]);

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
      const _cursorColor = randomHexColor();
  
      let _socket; // May not be connected
      if (params.join) {
        _socket = socketClient('http://localhost:3000', { query: { join : params.join.trim(), nickname, cursorColor: _cursorColor }});
      } else {
        _socket = socketClient('http://localhost:3000', { query: { nickname, cursorColor: _cursorColor }});
      }

      _socket.on("room joined", (msg) => {
        console.log("Joined ", msg);
        setRoom(msg);
      });
  
      _socket.on("connect", (msg) => {
        connectedAlready = true;
        setSocket(_socket);
        setCursorColor(_cursorColor);
        setMouseCursors((state) => [...state, <MouseCursor key={uuidv4()} fill={_cursorColor} nickname={nickname + " (Me)"} />]);
      });

      _socket.on("user joined", (msg) => {
        setMouseCursors((state) => [...state, <MouseCursor key={uuidv4()} fill={msg.cursorColor} nickname={msg.nickname} />]);
      });

      _socket.on("user left", (msg) => {

      })
    }
  }

  function broadcastDrawEvent(e) {
    if (socket) {
      socket.emit("draw", e);
    }
  }

  return (
    <UserContext.Provider value={{
      nickname,
      setNickname,
      room,
      setRoom,
      socket,
      connect,
      broadcastDrawEvent,
    }}>
      <WelcomeModal/>
      <RoomInfo/>
      {mouseCursors}
      <div onMouseMove={(e) => { setMousepos({ x: e.pageX, y: e.pageY }); }}>
        <CanvasProvider>
          <DrawingArea></DrawingArea>
        </CanvasProvider>
      </div>
      <BrushSelector></BrushSelector>
    </UserContext.Provider>
  );
}

export default App;
