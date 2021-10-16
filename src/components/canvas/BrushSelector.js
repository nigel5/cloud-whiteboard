import styled from "styled-components";
import { PropTypes } from 'react'

const StyledBrushSelector = styled.div`
`;

function BrushSelector({ setBrush }) {
    return (
        <div className="container">
            <button title='Pencil' onClick={() => { setBrush('pencil'); }}>Pencil</button>
            <button title='Line' onClick={() => { setBrush('line'); }}>Line</button>
        </div>
    )
}

export default BrushSelector;