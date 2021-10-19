import { createContext, useState, useRef, useContext, useEffect } from 'react';
import { UserContext } from '../../App';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
    const { broadcastDrawEvent, socket } = useContext(UserContext);
    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushSettings, setBrushSettings] = useState({
        brush: "pencil",
        brushColor: "black",
    });
    const [scale, setScale] = useState(2);

    const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 });

    function getPos(e) {
        const _e = e.nativeEvent;
        const x = _e.offsetX;
        const y = _e.offsetY;
        return {
            x,
            y
        };
    }

    function finishDrawingLine(startXY, endXY) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.moveTo(startXY.x, startXY.y);
        ctx.lineTo(endXY.x, endXY.y);
        ctx.stroke();
        ctx.closePath();
        setMouseStart({ x: 0, y:0 });
    }

    function distance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    function finishDrawingCircle(centerXY, endXY) {
        const r = distance(centerXY, endXY);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.beginPath();
        ctx.arc(centerXY.x, centerXY.y, r, 0, 2*Math.PI);
        ctx.stroke();
        ctx.closePath();
        setMouseStart({ x: 0, y:0 });
    }

    function finishDrawingRectangle(topLeftXY, bottomRightXY) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const w = topLeftXY.x - bottomRightXY.x; // The canvas API knows how to handle negative values
        const h = topLeftXY.y - bottomRightXY.y;

        ctx.beginPath();
        ctx.rect(bottomRightXY.x, bottomRightXY.y, w, h);
        ctx.stroke();
        ctx.closePath();
        setMouseStart({ x: 0, y:0 });
    }

    function onSocketDrawEventMove(start, end, color, emit) {
        const ctx = canvasRef.current.getContext("2d");
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
    }

    function parseDataPacket(data) {
        switch(data.event) {
            case "move":
                onSocketDrawEventMove(data.start, data.end);
                break;
            case "end":
                setIsDrawing(false);
                if (data.brush === "pencil") {
                    onMouseUp({
                        nativeEvent: {
                            remoteEvent: true,
                            offsetX: data.x,
                            offsetY: data.y
                        }
                    }, false, data.brushSettings);
                } else if (data.brush === "line") {
                    finishDrawingLine(data.start, data.end);
                } else if (data.brush === "circle") {
                    finishDrawingCircle(data.start, data.end);
                } else if (data.brush === "rectangle") {
                    finishDrawingRectangle(data.start, data.end);
                }
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
            function setupCanvas(canvasToSetup) {
                canvasToSetup.width = window.innerWidth * scale;
                canvasToSetup.height = window.innerHeight * scale
    
                canvasToSetup.style.height = `${window.innerHeight}px`;
                canvasToSetup.style.width = `${window.innerWidth}px`;
    
                const ctx = canvasToSetup.getContext("2d");
                ctx.scale(scale, scale);
                ctx.linecap = "round";
                ctx.strokeStyle = "black";
                ctx.lineWidth = 5;
            }
            const canvas = canvasRef.current;
            const previewCanvas = previewCanvasRef.current;
            setupCanvas(canvas);
            setupCanvas(previewCanvas);
        }

        if (socket) {
            socket.emit("request draw events");
            /**
             * This is emitted if we join an existing room
             */
            socket.on("existing draw data", (msg) => {
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
    const onMouseUp = (e, broadcast) => {
        if (e.target) 
            e.preventDefault();
    
        if (!isDrawing) return;
        
        setIsDrawing(false);
        
        const { x, y } = getPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const previewCanvas = previewCanvasRef.current;
        const previewCtx = previewCanvas.getContext("2d");

        switch (brushSettings.brush) {
            case "pencil":
                ctx.closePath();
                break;
            case "line":
                previewCtx.clearRect(0, 0, canvas.height * scale, canvas.width * scale);
                finishDrawingLine(mouseStart, { x, y });
                break;
            case "circle":
                previewCtx.clearRect(0, 0, canvas.height * scale, canvas.width * scale);
                finishDrawingCircle(mouseStart, { x, y });
                break;
            case "rectangle":
                previewCtx.clearRect(0, 0, canvas.height * scale, canvas.width * scale);
                finishDrawingRectangle({ x, y }, mouseStart);
                break;
            default:
                break;
        }

        if (broadcast) {
            switch (brushSettings.brush) {
                case "pencil":
                    broadcastDrawEvent({
                        brush: "pencil",
                        event: "end",
                        brushSettings,
                        start: {
                            x: mouseStart.x,
                            y: mouseStart.y,
                        },
                        end: {
                            x,
                            y,
                        },
                    });
                    break;
                case "line":
                    broadcastDrawEvent({
                        brush: "line",
                        event: "end",
                        brushSettings,
                        start: {
                            x: mouseStart.x,
                            y: mouseStart.y,
                        },
                        end: {
                            x,
                            y,
                        },
                    });
                    break;
                case "circle":
                    broadcastDrawEvent({
                        brush: "circle",
                        event: "end",
                        brushSettings,
                        start: {
                            x: mouseStart.x,
                            y: mouseStart.y,
                        },
                        end: {
                            x,
                            y,
                        },
                    });
                    break;
                case "rectangle":
                    broadcastDrawEvent({
                        brush: "rectangle",
                        event: "end",
                        brushSettings,
                        start: {
                            x: mouseStart.x,
                            y: mouseStart.y,
                        },
                        end: {
                            x,
                            y,
                        },
                    });
                    break;
                default:
                    break;
            }
        }
    }

    const onMouseDown = (e, broadcast) => {
        if (e.target) 
            e.preventDefault();
        
        setIsDrawing(true);
        
        const { x, y } = getPos(e);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const previewCanvas = previewCanvasRef.current;
        const previewCtx = previewCanvas.getContext("2d");

        setMouseStart({ x, y });

        switch (brushSettings.brush) {
            case "pencil":
                ctx.strokeStyle = brushSettings.brushColor;
                break;
            case "line":
                // For drawing a line, we want to preview the line on the preview canvas first before committing to the main canvas
                previewCtx.strokeStyle = brushSettings.brushColor;
                break;
            case "circle":
                previewCtx.strokeStyle = brushSettings.brushColor;
                break;
            case "rectangle":
                previewCtx.strokeStyle = brushSettings.brushColor;
                break;
            default:
                break;
        }
    }

    const onMouseMove = (e, broadcast) => {
        if (e.target) 
            e.preventDefault();
            
        if (!isDrawing) return;

        const { x, y } = getPos(e);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const previewCanvas = previewCanvasRef.current;
        const previewCtx = previewCanvas.getContext("2d");

        switch (brushSettings.brush) {
            case "pencil":
                setMouseStart({ x, y }); // Only for pencil. For the other shapes we need to remember the starting point
                ctx.beginPath();
                ctx.moveTo(mouseStart.x, mouseStart.y);
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.closePath();
                break;
            case "line":
                previewCtx.clearRect(0, 0, canvas.height * scale, canvas.width * scale);
                previewCtx.beginPath();
                previewCtx.moveTo(mouseStart.x, mouseStart.y);
                previewCtx.lineTo(x, y);
                previewCtx.stroke();
                break;
            case "circle":
            {
                const r = distance(mouseStart, { x, y });
                previewCtx.clearRect(0, 0, canvas.height * scale, canvas.width * scale);
                previewCtx.beginPath();
                previewCtx.arc(mouseStart.x, mouseStart.y, r, 0, 2*Math.PI);
                previewCtx.stroke();
                previewCtx.closePath();
                break;
            }
            case "rectangle":
            {
                const w = x - mouseStart.x;
                const h = y - mouseStart.y;
                previewCtx.clearRect(0, 0, canvas.height * scale, canvas.width * scale);
        
                previewCtx.beginPath();
                previewCtx.moveTo(x, y);
                previewCtx.rect(mouseStart.x, mouseStart.y, w, h);
                previewCtx.stroke();
                previewCtx.closePath();
                break;
            }
            default:
                break;
        }

        if (broadcast) {
            switch (brushSettings.brush) {
                case "pencil":
                    broadcastDrawEvent({
                        brush: "pencil",
                        event: "move",
                        brushSettings,
                        start: {
                            x: mouseStart.x,
                            y: mouseStart.y,
                        },
                        end: {
                            x,
                            y,
                        },
                    });
                    break;
                case "line":
                case "circle":
                    break;
                default:
                    break;
            }
        }
    }

    /**
     *  Clears the main canvas
     * @param {*} broadcast Emit the event
     */
    const clear = (broadcast) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.height * scale, canvas.width * scale);

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
                previewCanvasRef,
                brushSettings,
                setBrushSettings,
                clear,
            }}
        >
            {children}
        </CanvasContext.Provider>
    )
}