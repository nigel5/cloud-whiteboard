import { useContext } from "react";
import { UserContext } from "../App";

function RoomInfo() {
    const { room } = useContext(UserContext);

    return (
        <div>
            <p>Currently in room <a target="_blank" href={`http://localhost:3000?join=${room}`}>localhost:3000?join={room}</a></p>
        </div>
    )
}

export default RoomInfo;