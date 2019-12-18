// rooms contains user
let rooms = [];
let activeUserArr = []

/**
 * id as socket id
 */
exports.addUserToActiveList =  (userId) => {
    if (userId){
        const index = rooms.indexOf(userId);
        if (index===-1){
            activeUserArr.push(userId)
        }
    }
}

exports.isUserActive = userId => {
    const index = rooms.indexOf(userId);
    return index!== -1;
}

/**
 * add room chat
 */
exports.createRoom = ({room, members}) => {
    const isRoomExist = rooms.filter(item => item.room === room);
    if (isRoomExist){
        return {error: "Phòng đã tồn tại."}
    } else {
        rooms.push({room, members})
    }
}
/**
 * when user online, get room chat to join user to those
 */
exports.getRoomChatForUser = ({userId}) => {
    const roomContainUser = room.filter(item => item.members.indexOf(userId) !== 1);
    return roomContainUser;
}

exports.addUserToRoom = async ({ id, userId, displayName, room }) => {
    // console.log("rooms arr: ", rooms);
    if (!userId) {
        return { error: 'id người chơi không được rỗng' };
    }

    const existingRoom = rooms.find(room => room.id === id);
    if (existingRoom) {
        return { error: "Phòng đã được tạo", room: existingRoom }
    }

    // if gameId is exist
    if (room) {
        // TODO: For advanced feature ...
        console.log("on game Id != undefined")

    }
    else {
        room = userId;
        const user = {id, userId, displayName, room};
         rooms.push(user)
        // console.log("new user in room: ", user);
        return {user}
    }
}

exports.removeUserFromRoom = (id) => {
    const index = rooms.findIndex((room) => room.id === id);

    if (index !== -1) return rooms.splice(index, 1)[0];
}