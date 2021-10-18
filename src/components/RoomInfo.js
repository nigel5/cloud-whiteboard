import { useContext } from "react";
import { UserContext } from "../App";
import { serverUrl } from "../settings.json";

function RoomInfo() {
    const { room } = useContext(UserContext);

    return (
        <div>
            <p>Currently in room <a target="_blank" rel="noreferrer noopener" href={`${serverUrl}?join=${room}`}>{serverUrl}?join={room}</a></p>
        </div>
    )
}

export default RoomInfo;