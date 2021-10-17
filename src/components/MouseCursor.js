import { useState } from "react";
import styled from "styled-components";

const StyledMouseCursor = styled.svg`
    position: absolute;
    z-index: 999;
    pointer-events: none;

    text {
        -webkit-user-select: none; /* Safari */        
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE10+/Edge */
        user-select: none; /* Standard */
    }
`;

function MouseCursor({ fill, nickname }) {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    return (
        <StyledMouseCursor>
            <circle cx="15" cy="15" r="7.5" stroke="black" strokeWidth="3" fill={fill} />
            <text x="20" y="35">{nickname}</text>
        </StyledMouseCursor>
    )
}

export default MouseCursor;