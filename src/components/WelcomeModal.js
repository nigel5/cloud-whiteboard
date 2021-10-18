import { useState, useContext } from "react";
import { UserContext } from "../App";

function WelcomeModal() {
    const userContext = useContext(UserContext);

    const [modelClassName, setModelClassName] = useState("is-active modal");

    const onValueChange = (e) => {
        if (e.target.name === "nickname") {
            userContext.setNickname(e.target.value);
        }
    }
    
    const closeModal = (e) => {
        e.preventDefault();

        if (userContext.nickname.length > 0) {
            setModelClassName("modal");
            userContext.connect();
        } else {
            alert("Please enter a nickname");
        }
    }

    return (
        <div className={modelClassName}>
            <div className="modal-background"></div>
            <div className="modal-content">
                <div className="box">
                    <h1 className="title">Welcome to Cloud Whiteboard</h1>
                    <h2 className="subtitle">Please enter a nickname</h2>
                    <form className="field has-addons is-medium" onSubmit={closeModal}>
                        <div className="control" style={{ width: "100%" }}>
                            <input autoFocus className="input" type="text" name="nickname" placeholder="Nickname" value={userContext.nickname} onChange={onValueChange} />
                        </div>
                        <div className="control">
                            <button className="button is-primary" type="submit">
                                Ok
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <button onClick={() => { setModelClassName("modal"); }} className="is-large" aria-label="close">Close</button>
        </div>
    )
}

export default WelcomeModal;