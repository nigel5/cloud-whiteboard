import styled from "styled-components";

const StyledToolbox = styled.div`
    background: #f5f5f5;
    padding: 1em;
`;

function Toolbox({ setBrushSettings, brushSettings, clear }) {
    const saveCanvas = () => {
        const canvasSave = document.getElementById('canvas');
        const d = canvasSave.toDataURL('image/png');
        const w = window.open(d, "_blank" );
        w.document.write("<img src='"+d+"' alt='from canvas'/>");
    }

    return (
        <>
        <StyledToolbox className="container">
            <div className="buttons">
                <button name="pencil" className={brushSettings.brush === "pencil" ? "button is-primary" : "button"} onClick={() => setBrushSettings((state) => ({...state, brush: "pencil"}))}>Pencil</button>
                <button name="line" className={brushSettings.brush === "line" ? "button is-primary" : "button"} onClick={() => setBrushSettings((state) => ({...state, brush: "line"}))}>Line</button>
                <input type="color" name="Color" value={brushSettings.brushColor} onChange={(e) => { setBrushSettings((state) => ({...state, brushColor: e.target.value })) }}/>
                <button className="button" onClick={clear}>Clear</button>
                <button className="button" onClick={saveCanvas}>Save</button>
            </div>
        </StyledToolbox>
        </>
    )
}

export default Toolbox;