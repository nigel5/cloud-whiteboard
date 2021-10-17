import './App.css';
import DrawingArea from './components/canvas/DrawingArea';
import BrushSelector from './components/canvas/BrushSelector';
import { useEffect } from 'react';
import 'bulma/css/bulma.min.css';
import socketClient from "socket.io-client";


function App() {
  useEffect(() => {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());
    let socket;

    if (params.join) {
      socket = socketClient('http://localhost:3001', { query: "join=" + params.join.trim() });
    } else {
      socket = socketClient('http://localhost:3001');
    }
    socket.on("draw", "draw event");
  });

  return (
    <>
      <div>
        <DrawingArea></DrawingArea>
      </div>
      <BrushSelector></BrushSelector>
    </>
  );
}

export default App;
