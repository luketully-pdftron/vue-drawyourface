import localforage from "localforage"

export const getFace = (userId) => {
    return localforage.getItem(userId)
};


export const saveFace = (userId, face) => {
    localforage.setItem(userId, {drawingData: face});
}