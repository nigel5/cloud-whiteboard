import styled from "styled-components";

const StyledToolbox = styled.div`
    background: #f5f5f5;
`;

function Toolbox({ setBrushSettings, brushSettings, clear }) {
    return (
        <StyledToolbox className="container">
            <div className="level-item has-text-centered">
                <button title='Pencil' onClick={() => setBrushSettings((state) => ({...state, brush: "pencil"}))}>Pencil</button>
            </div>
            <div className="level-item has-text-centered">
                <input type="color" name="Color" value={brushSettings.brushColor} onChange={(e) => { setBrushSettings((state) => ({...state, brushColor: e.target.value })) }}/>
                <label htmlFor="Color">Color</label>
            </div>
            <div className="level-item has-text-centered">
                <button title='Clear' onClick={clear}>Clear</button>
            </div>
        </StyledToolbox>
    )
}

export default Toolbox;