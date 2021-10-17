import styled from "styled-components";
import { UserContext } from "../App";

const StyledMouseCursor = styled.svg`
    positive: absolute;
    z-index: 999;
`;

function MouseCursor() {
    return (
        <StyledMouseCursor height="10" width="10">
            <circle cx="0" cy="0" r="40" stroke="black" strokeWidth="3" fill="red" />
        </StyledMouseCursor>
    )
}

export default MouseCursor;