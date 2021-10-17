import { useContext } from "react";
import { UserContext } from "../App";

function RoomInfo() {
    const { room } = useContext(UserContext);

    return (
        <div>
            <p>Currently in room {room}</p>
        </div>
    )
}

export default RoomInfo;