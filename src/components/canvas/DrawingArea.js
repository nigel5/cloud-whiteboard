import { useContext } from "react";
import styled from "styled-components";
import { CanvasContext } from "./CanvasContext";
import Toolbox from "./Toolbox";

const StyledDrawingArea = styled.canvas`
`;

function DrawingArea(props) {
    const { canvasRef, onMouseMove, onMouseDown, onMouseUp, clear, brushSettings, setBrushSettings } = useContext(CanvasContext);

    return (
    <>
        <Toolbox clear={clear} brushSettings={brushSettings} setBrushSettings={setBrushSettings} />
        <StyledDrawingArea
            ref={canvasRef}
            onMouseMove={(e) => onMouseMove(e, true)}
            onMouseDown={(e) => onMouseDown(e, true)}
            onMouseUp={(e) => onMouseUp(e, true)}></StyledDrawingArea>
    </>
    );
}

export default DrawingArea;