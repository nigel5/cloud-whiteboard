import { useContext } from "react";
import styled from "styled-components";
import { CanvasContext } from "./CanvasContext";
import Toolbox from "./Toolbox";

const StyledDrawingArea = styled.canvas`
    border-style: solid;
    border-width: 3px;
    touch-action: none;
    position: absolute;
`;

const StyledCanvasPreviewArea = styled.canvas`
    touch-action: none;
    position: absolute;
`;

function DrawingArea(props) {
    const { canvasRef, previewCanvasRef, onMouseMove, onMouseDown, onMouseUp, clear, brushSettings, setBrushSettings } = useContext(CanvasContext);

    return (
    <>
        <Toolbox clear={clear} brushSettings={brushSettings} setBrushSettings={setBrushSettings} />
        <StyledCanvasPreviewArea id="canvasPreview" ref={previewCanvasRef}></StyledCanvasPreviewArea>
        <StyledDrawingArea
            id="canvas"
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