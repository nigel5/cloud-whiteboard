import './App.css';
import DrawingArea from './components/canvas/DrawingArea';
import BrushSelector from './components/canvas/Toolbox';
import { useEffect, createContext, useState } from 'react';
import 'bulma/css/bulma.min.css';
import socketClient from "socket.io-client";
import WelcomeModal from './components/WelcomeModal';
import RoomInfo from './components/RoomInfo';
import MouseCursor from './components/MouseCursor';
import { CanvasProvider } from './components/canvas/CanvasContext';
import { randomHexColor } from './util/random';
import { socketServer, mouseCursorEmitInterval } from "./settings.json";

export const UserContext = createContext();

function App() {
  const [nickname, setNickname] = useState("");
  // const [cursorColor, setCursorColor] = useState("#000000");
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState();
  const [mousepos, setMousepos] = useState({ x: 0, y: 0 });

  const [mouseCursors, setMouseCursors] = useState({});
  const [leftSocketIds, setLeftSocketIds] = useState([]);

  let connectedAlready = false;

  /**
   * Mouse positions and cursors
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (socket)
        socket.emit("mouse move", mousepos);
    }, mouseCursorEmitInterval);
    return () => {
      window.clearInterval(timer);
    };
  }, [mousepos, leftSocketIds]);

  function connect() {
    if (connectedAlready === false) {

      const urlSearchParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlSearchParams.entries());
      const _cursorColor = randomHexColor();
  
      let _socket; // May not be connected
      if (params.join) {
        _socket = socketClient(socketServer, { query: { join : params.join.trim(), nickname, cursorColor: _cursorColor }});
      } else {
        _socket = socketClient(socketServer, { query: { nickname, cursorColor: _cursorColor }});
      }

      _socket.on("room joined", (msg) => {
        console.log("Joined ", msg);
        setRoom(msg);
      });
  
      _socket.on("connect", (msg) => {
        connectedAlready = true;
        setSocket(_socket);
        // setCursorColor(_cursorColor);
      });

      // _socket.on("user joined", (msg) => {
      //   const socketId = Object.keys(msg)[0]
      // });

      _socket.on("user left", (msg) => {
        const socketId = Object.keys(msg)[0];
        setLeftSocketIds((state) => [...state, socketId]);
      });

      /**
       * Update the position of each client cursor
       */
      _socket.on("mouse move", (msg) => {
        const data = msg;
        data[_socket.id]["nickname"] = data[_socket.id]["nickname"] + " (Me)";
        data[_socket.id]["isSelf"] = true;
        setMouseCursors(data);
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
      {
        Object.keys(mouseCursors).map((key) => {
          if (mouseCursors[key].isSelf === true) {
            return (<MouseCursor key={key} fill={mouseCursors[key].cursorColor} nickname={mouseCursors[key].nickname} socketId={key} pos={{ x: 50, y: 50 }} />)
          }
          return (<MouseCursor key={key} fill={mouseCursors[key].cursorColor} nickname={mouseCursors[key].nickname} socketId={key} pos={mouseCursors[key].mousePos} />);
        })
      }
      <div onMouseMove={(e) => { setMousepos({ x: e.pageX, y: e.pageY }); }}>
        <CanvasProvider>
          <DrawingArea></DrawingArea>
        </CanvasProvider>
      </div>
      {/* <BrushSelector></BrushSelector> */}
    </UserContext.Provider>
  );
}

export default App;
