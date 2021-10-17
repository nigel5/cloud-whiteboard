export const randomInteger = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const randomAlphaNumeric = () => {
    const valid = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return valid[randomInteger(0, valid.length)];
}

export const randomHexColor = () => {
    const valid = ['a', 'b', 'c', 'd', '4', '5', '6', '7', '8', '9'];
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color = color + valid[randomInteger(0, valid.length-1)];
    }
    return color;
}