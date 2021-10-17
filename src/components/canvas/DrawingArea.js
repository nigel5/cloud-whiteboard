import { useContext } from "react";
import styled from "styled-components";
import BrushSelector from "./BrushSelector";
import { CanvasContext } from "./CanvasContext";

const StyledDrawingArea = styled.canvas`
`;

function DrawingArea(props) {
    const canvasContext = useContext(CanvasContext);

    return (
    <>
        <BrushSelector setBrush={canvasContext.setBrush}/>
        <StyledDrawingArea
            ref={canvasContext.canvasRef}
            onMouseMove={(e) => canvasContext.onMouseMove(e, true)}
            onMouseDown={(e) => canvasContext.onMouseDown(e, true)}
            onMouseUp={(e) => canvasContext.onMouseUp(e, true)}></StyledDrawingArea>
    </>
    );
}

export default DrawingArea;