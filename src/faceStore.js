import localforage from "localforage"

export const getFace = (userId) => {
    return localforage.getItem(userId)
};


export const saveFace = (userId, face) => {
    /* Save the current annotation data along with it's timestamp */
    const currentTime = Date.now(); // Store the UTC timestamp
    return localforage.setItem(userId, {drawingData: face, timestamp: currentTime.toString()});
}