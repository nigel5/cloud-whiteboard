import { createContext, useState, useRef, useContext, useEffect } from 'react';
import { UserContext } from '../../App';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
    const { broadcastDrawEvent, socket } = useContext(UserContext);
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSettings, setbrushSettings] = useState({
        brush: "pencil",
        brushColor: "black",
    });
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

    function parseDataPacket(data) {
        switch(data.event) {
            case "begin":
                setIsDrawing(true);
                onMouseDown({
                    remoteEvent: true,
                    nativeEvent: {
                        offsetX: data.x,
                        offsetY: data.y
                    }
                }, false, data.brushSettings);
                break;
            case "move":
                onMouseMove({
                    remoteEvent: true,
                    nativeEvent: {
                        offsetX: data.x,
                        offsetY: data.y
                    }
                }, false, data.brushSettings);
                break;
            case "end":
                setIsDrawing(false);
                onMouseUp({
                    nativeEvent: {
                        remoteEvent: true,
                        offsetX: data.x,
                        offsetY: data.y
                    }
                }, false, data.brushSettings);
                break;
            case "clear":
                clear();
                break;
            default:
                break;
        }
    }

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth * scale;
            canvas.height = window.innerHeight * scale

            canvas.style.height = `${window.innerHeight}px`;
            canvas.style.width = `${window.innerWidth}px`;

            const ctx = canvas.getContext("2d");
            ctx.scale(scale, scale);
            ctx.linecap = "round";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 5;
            canvasRef.current = canvas;
        }

        if (socket) {
            socket.emit("request draw events");
            /**
             * This is emitted if we join an existing room
             */
            socket.on("existing draw data", (msg) => {
                console.log(msg);
                msg.forEach((data) => parseDataPacket(data));
            });

            socket.on("draw", (msg) => {
                parseDataPacket(msg);
            });
        }
    }, [socket]);

    /**
     * 
     * @param {*} e Event
     * @param {*} broadcast Whether to emit this event to other sockets
     * @param {*} remoteBrushSettings Override this component state brush settings
     */
    const onMouseUp = (e, broadcast, remoteBrushSettings) => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.closePath();
        if (broadcast) {
            broadcastDrawEvent({
                brush: "pencil",
                event: "end",
                brushSettings,
            });
        }
    }

    const onMouseDown = (e, broadcast, remoteBrushSettings) => {
        setIsDrawing(true);
        const { x, y } = getPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.beginPath();
        if (remoteBrushSettings) {
            ctx.strokeStyle = remoteBrushSettings.brushColor;
        } else {
            ctx.strokeStyle = brushSettings.brushColor;
        }
        ctx.moveTo(x, y);
        if (broadcast) {
            broadcastDrawEvent({
                brush: "pencil",
                event: "begin",
                x,
                y,
                brushSettings,
            });
        }
    }

    const onMouseMove = (e, broadcast, remoteBrushSettings) => {
        if (isDrawing || e.remoteEvent) {
            const { x, y } = getPos(e);

            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");

            if (remoteBrushSettings) {
                ctx.strokeStyle = remoteBrushSettings.brushColor;
            } else {
                ctx.strokeStyle = brushSettings.brushColor;
            }

            ctx.lineTo(x, y);
            ctx.stroke();
            if (broadcast) {
                broadcastDrawEvent({
                    brush: "pencil",
                    event: "move",
                    x,
                    y,
                    brushSettings,
                });
            }
        }
    }

    const clear = (broadcast) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.height, canvas.width);

        if (broadcast) {
            broadcastDrawEvent({
                event: "clear",
                brushSettings,
            });
        }
    }

    return (
        <CanvasContext.Provider
            value={{
                onMouseUp,
                onMouseDown,
                onMouseMove,
                canvasRef,
                brushSettings,
                setbrushSettings,
                clear,
            }}
        >
            {children}
        </CanvasContext.Provider>
    )
}