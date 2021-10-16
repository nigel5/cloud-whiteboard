import { useState, useRef, useEffect } from "react";
import rough from "roughjs/bundled/rough.esm";
import styled from "styled-components";

const StyledDrawingArea = styled.canvas`
    border: red;
    border-style: solid;
    border-width: 5px;
    width: 500px;
    height: 500px;
`;


const scale = 3;
function getMousePos(canvasDom, mouseEvent) {
    var rect = canvasDom.getBoundingClientRect();
    return {
      x: (mouseEvent.clientX - rect.left) * scale,
      y: (mouseEvent.clientY - rect.top) * scale
    };
}

function DrawingArea(props) {
    const { draw, ...rest } = props;

    // Loading
    const [ctx, setCtx] = useState(null);

    // Current cursors on the whiteboard
    const [users, setUsers] = useState([]);

    // Are changes being made right now?
    const [isDrawing, setIsDrawing] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });

    // Ref to actual html canvas
    const canvasRef = useRef(null);

    // Rough.js drawing lib
    let rgh = null;

    useEffect(() => {
        const cRef = canvasRef.current;
        cRef.width = 500 * scale;
        cRef.height = 500 * scale;
        const temp = cRef.getContext('2d');
        temp.fillStyle = "#000000";
        rgh = rough.canvas(canvasRef.current);
        rgh.line(60, 60, 190, 60);
        setCtx(temp);
        let animationFrameId;

        const render = () => {
            animationFrameId = window.requestAnimationFrame(render);
        }

        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }

    }, [canvasRef]);

    // Mouse events
    const onMouseMove = (e) => {
        if (isDrawing) {
            const cRef = canvasRef.current;
            const pos = getMousePos(cRef, e);
            ctx.fillRect(e.pageX - cRef.offsetLeft, e.pageY - cRef.offsetTop, 1, 1);
            ctx.fill();
        }
    }

    const onMouseDown = (e) => {
        setStart({ x: e.clientX, y: e.clientY });
        setIsDrawing(true);
    }

    const onMouseUp = (e) => {
        setIsDrawing(false);
    }

    return (
        <StyledDrawingArea
            ref={canvasRef} {...rest}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}></StyledDrawingArea>
    );
}

DrawingArea.defaultProps = {

}

export default DrawingArea;