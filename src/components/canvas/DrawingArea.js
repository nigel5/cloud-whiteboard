import { useState, useRef, useEffect } from "react";
import rough from "roughjs/bundled/rough.esm";

function DrawingArea() {
    // Loading
    const [ready, setReady] = useState(false);

    // Current cursors on the whiteboard
    const [users, setUsers] = useState([]);

    // Are changes being made right now?
    const [isDrawing, setIsDrawing] = useState(false);

    // Ref to actual html canvas
    const canvasRef = useRef(null);

    // Rough.js drawing lib
    let ctx = null;
    let rgh = null;

    useEffect(() => {
        if (ready === false) {
            console.log("Ready");
            ctx = canvasRef.current.getContext('2d');
            rgh = rough.canvas(canvasRef.current);
            rgh.line(60, 60, 190, 60);
            setReady(true);
        }
    }, [canvasRef]);

    return (
        <canvas ref={canvasRef}></canvas>
    );
}

DrawingArea.defaultProps = {

}

export default DrawingArea;