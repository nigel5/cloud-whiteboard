import { createContext, useState, useRef, useContext, useEffect } from 'react';
import { UserContext } from '../../App';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
    const { broadcastDrawEvent, socket } = useContext(UserContext);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brush, setBrush] = useState("pencil");
    const [scale, setScale] = useState(2);

    function getPos(e) {
        const _e = e.nativeEvent;
        const x = _e.offsetX;
        const y = _e.offsetY;
        return {
            x,
            y
        };
    }

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth * scale;
            canvas.height = window.innerHeight * scale
    
            canvas.style.height = `${window.innerHeight}px`;
            canvas.style.width = `${window.innerWidth}px`;
    
            const ctx = canvas.getContext("2d");
            ctx.scale(scale,scale);
            ctx.linecap = "round";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 5;
            canvasRef.current = canvas;
        }

        if (socket) socket.on("draw", (msg) => {
            const data = JSON.parse(msg);
            if (data.event === "begin") {
            setIsDrawing(true);
              onMouseDown({
                remoteEvent: true,
                nativeEvent: {
                  offsetX: data.x,
                  offsetY: data.y
                }
              }, false);
            } else if (data.event === "move") {
              onMouseMove({
                remoteEvent: true,
                nativeEvent: {
                  offsetX: data.x,
                  offsetY: data.y
                }
              }, false);
    
            } else if (data.event === "end") {
                setIsDrawing(false);
              onMouseUp({
                nativeEvent: {
                  remoteEvent: true,
                  offsetX: data.x,
                  offsetY: data.y
                }
              }, false);
            }
          });
    }, [socket]);

    const receiveDrawEvents = (e) => {
    }

    const onMouseUp = (e, broadcast) => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.closePath();
        if (broadcast) {
            broadcastDrawEvent({
                brush: "pencil",
                event: "end",
            });
        }
    }

    const onMouseDown = (e, broadcast) => {
        setIsDrawing(true);
        const { x, y } = getPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(x, y);
        if (broadcast) {
            broadcastDrawEvent({
                brush: "pencil",
                event: "begin",
                x,
                y,
            });
        }
    }

    const onMouseMove = (e, broadcast) => {
        if (isDrawing || e.remoteEvent) {
            const { x, y } = getPos(e);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            ctx.lineTo(x, y);
            ctx.stroke();
            if (broadcast) {
                broadcastDrawEvent({
                    brush: "pencil",
                    event: "move",
                    x,
                    y,
                });
            }
        }
    }

    const clear = () => {

    }

    return (
        <CanvasContext.Provider
            value={{
                onMouseUp,
                onMouseDown,
                onMouseMove,
                canvasRef,
                setBrush,
            }}
        >
            { children }
        </CanvasContext.Provider>
    )
}