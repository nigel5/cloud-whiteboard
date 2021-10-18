import { useContext } from "react";
import styled from "styled-components";
import { CanvasContext } from "./CanvasContext";
import Toolbox from "./Toolbox";

const StyledDrawingArea = styled.canvas`
    border-style: solid;
    border-width: 3px;
    touch-action: none;
`;

function DrawingArea(props) {
    const { canvasRef, onMouseMove, onMouseDown, onMouseUp, clear, brushSettings, setBrushSettings } = useContext(CanvasContext);

    return (
    <>
        <Toolbox clear={clear} brushSettings={brushSettings} setBrushSettings={setBrushSettings} />
        <StyledDrawingArea
            ref={canvasRef}
            onMouseDown={(e) => onMouseDown(e, true)}
            onMouseMove={(e) => onMouseMove(e, true)}
            onMouseUp={(e) => onMouseUp(e, true)}
            onTouchStart={(e) => onMouseDown(e, true)}
            onTouchMove={(e) => onMouseMove(e, true)}
            onTouchEnd={(e) => onMouseUp(e, true)}></StyledDrawingArea>
    </>
    );
}

export default DrawingArea;