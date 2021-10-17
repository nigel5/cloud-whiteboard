import { useState, useRef, useContext, useEffect } from "react";
import rough from "roughjs/bundled/rough.esm";
import styled from "styled-components";
import BrushSelector from "./BrushSelector";
import { UserContext } from "../../App";

const StyledDrawingArea = styled.canvas`
`;


const rghGen = rough.generator();

var getMousePosition = function (e, rect) {
    return {
        x: e.clientX,
        y: e.clientY
    };
};

function DrawingArea(props) {
    const { socket } = useContext(UserContext);

    const { draw, ...rest } = props;

    const [brush, setBrush] = useState('pencil');

    // Roughjs drawables
    const [drawables, setDrawables] = useState([]);
    
    // Canvas path points - Pencil tool
    const [points, setPoints] = useState([]); // Currently drawing this with pencil
    const [completedFreeformCurve, setCompletedFreeformCurves] = useState([]); // Finished


    // Are changes being made right now?
    const [isDrawing, setIsDrawing] = useState(false);

    // Ref to actual html canvas
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const rghCan = rough.canvas(canvas);
        points.forEach((x) => {
            ctx.moveTo(x.x, x.y);
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineTo(x.x, x.y);
            ctx.stroke();
        })

        completedFreeformCurve.forEach((x) => {
            ctx.beginPath();

            x.forEach((point) => {
              ctx.lineTo(point.x, point.y);
              ctx.stroke();
            });

            ctx.closePath();
        })

        drawables.forEach((x) => {
            switch (x.brush) {
                case 'pencil':
                    break;
                default:
                    rghCan.draw(x.drawable);
                    break;
            }
        });

        return function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }, [drawables, completedFreeformCurve]);

    // Mouse events
    const onMouseMove = (e) => {
        if (isDrawing === true) {
            const pos = getMousePosition(e);

            switch (brush) {
                case 'line':
                    const copy = [...drawables];
                    const { x1, y1 } = drawables[drawables.length - 1];
                    copy[drawables.length - 1] = {
                        brush: 'line',
                        x1: x1,
                        y1: y1,
                        x2: pos.x,
                        y2: pos.y,
                        drawable: rghGen.line(x1, y1, pos.x, pos.y)
                    };
                    setDrawables(copy);
                    break;
                case 'pencil':
                    const newPoint = {
                        brush: 'pencil',
                        x: pos.x,
                        y: pos.y
                    };
                    setPoints((state) => [...state, newPoint]);
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext("2d");

                    ctx.lineTo(pos.x, pos.y);
                    ctx.lineWidth = 3;
                    ctx.lineCap = "round";
                    ctx.stroke();
                    break;
                default:
                    break;
            }
        }
    }

    const onMouseDown = (e) => {
        setIsDrawing(true);
        const pos = getMousePosition(e);
        switch (brush) {
            case 'line':
                const newLine = {
                    brush: 'line',
                    x1: pos.x,
                    y1: pos.y,
                    x2: pos.x,
                    y2: pos.y,
                    drawable: rghGen.line(pos.x, pos.y, pos.x, pos.y)
                };
                setDrawables((state) => [...state, newLine]);
                break;
            case 'pencil':
                const newPoint = {
                    brush: 'pencil',
                    x: pos.x,
                    y: pos.y
                };
                setPoints((state) => [...state, newPoint]);
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.moveTo(pos.x, pos.y);
                ctx.beginPath();
                socket.emit("draw", {
                    data: "hello world"
                });
                break;
            default:
                break;
        }
    }

    const onMouseUp = (e) => {
        setIsDrawing(false);

        switch (brush) {
            case 'line':
                break;
            case 'pencil':
                const canvas = canvasRef.current;
                const ctx = canvas.getContext("2d");
                ctx.closePath();
                const completedFreeformCurve = [...points];
                setPoints([]); // Current is done
                setCompletedFreeformCurves((state) => [...state, completedFreeformCurve]);
                break;
            default:
                break;
        }
    }

    return (
    <>
        <BrushSelector setBrush={setBrush}/>
        <StyledDrawingArea
            ref={canvasRef} {...rest}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            width={window.innerWidth}
            height={window.innerHeight}></StyledDrawingArea>
    </>
    );
}

export default DrawingArea;