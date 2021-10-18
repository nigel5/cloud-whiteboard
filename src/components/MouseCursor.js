import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

let animation = (prev, next) => keyframes`
    from: {
        left: ${prev.x};
        top: ${prev.y};
    }
    to: {
        left: ${next.x};
        top: ${next.y};
    }
`;

const StyledMouseCursor = styled.svg`
    position: absolute;
    z-index: 999;
    pointer-events: none;
    animation: ${props => animation(props.prevPos, props.nextPos)} 1s linear 1;
    text {
        -webkit-user-select: none; /* Safari */        
        -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* IE10+/Edge */
        user-select: none; /* Standard */
    }
`;

function MouseCursor({ fill, nickname, id, pos }) {
    const [prevPos, setPrevPos] = useState({ x: 0, y: 0 });


    useEffect(() => {

    }, [pos]);

    return (
        <StyledMouseCursor style={{ top: pos.y, left: pos.x }} prevPos={prevPos} nextPos={pos}>
            <circle cx="15" cy="15" r="7.5" stroke="black" strokeWidth="3" fill={fill} />
            <text x="20" y="35">{nickname}</text>
        </StyledMouseCursor>
    )
}

export default MouseCursor;