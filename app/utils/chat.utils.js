// rooms contains user
let rooms = [];

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