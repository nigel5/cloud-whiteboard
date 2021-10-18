import styled from "styled-components";

const StyledToolbox = styled.div`
`;

function Toolbox({ setBrushSettings, brushSettings, clear }) {
    return (
        <StyledToolbox className="container">
            <button title='Pencil' onClick={() => setBrushSettings((state) => ({...state, brush: "pencil"}))}>Pencil</button>
            <div>
                <input type="color" name="Color" value={brushSettings.color} onChange={(e) => {console.log(e)}}/>
                <label for="Color">Color</label>
            </div>
            <button title='Clear' onClick={clear}>Clear</button>
        </StyledToolbox>
    )
}

export default Toolbox;