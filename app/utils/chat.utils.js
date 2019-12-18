// rooms contains user
let rooms = [];
let activeUserArr = []

/**
 * id as socket id
 */
exports.addUserToActiveList =  ({userId, socketId}) => {
    if (userId){
        const index = rooms.findIndex(item => item.userId === userId)
        // 1 user can connect socket with many socketId
        if (index === -1){
            // add user to list
            activeUserArr.push({userId, socketId: [socketId]})
        } else if ( activeUserArr[index].socketId.indexOf(socketId)!== -1) {
            // update socketId
            activeUserArr[index].socketId.push(socketId);
            console.log("after push more socket: ", activeUserArr);
        }
    }
    // console.log("addUserToActiveList func acitve list: ", activeUserArr)
}

exports.isUserActive = userId => {
    const index = rooms.findIndex(item => item.userId === userId);
    return index !== -1;
}

/**
 * add room chat
 */
exports.createRoom = ({room, members}) => {
    const index = rooms.findIndex(item => item.room === room);
    if (index!== -1){
        return {error: "Phòng đã tồn tại."}
    } else {
        rooms.push({room, members})
    }
    console.log("create room: ", rooms)
}
/**
 * When user online, get room chat to join
 * Only get active room (in orther to get realtime message)
 */
exports.getRoomChatForUser = (userId) => {
    console.log("current room: ", rooms)
    const roomContainUser = rooms.filter(item => item.members.indexOf(userId) !== -1);
    return roomContainUser;
}

/**
 * output: array room that need to send message that roomate is off
 */
exports.removeUser = (socketId) => {
    // check to delete user from active list
    const indexActive = activeUserArr.findIndex(item => item.socketId.indexOf(socketId)!==-1);
    if (indexActive === -1 ){
        return [];
    }
    if (activeUserArr[indexActive].socketId.length === 1) { // if this is the lastest socket of user
        const userId = activeUserArr[indexActive].userId;
        // delete user from active list
        console.log("1.1 index:", indexActive)
        console.log("1.2 user:", userId)
        activeUserArr = [...activeUserArr.slice(0, indexActive), ...activeUserArr.slice(indexActive+1)]
        console.log("1.3 :", activeUserArr)
        // check to delete room if all member are not active
         const roomContainUser = this.getRoomChatForUser(userId)
         const roomSendNotification = [];
         roomContainUser.map(item => {
             const roomateId = item.members.filter(user => user !== userId);
             if (!this.isUserActive(roomateId)) {
                 // delete room
                 rooms = rooms.filter(roomItem => roomItem !== item.room)
             } else {
                // array room that need to send message that roomate is off
                 roomSendNotification.push(item.room)
             }
         })
         return roomSendNotification;
    } else {
        // delete socketId from user active
        activeUserArr[indexActive].socketId.splice(activeUserArr[indexActive].socketId.indexOf(socketId), 1);
        return []
    }
    

    

    // if (!this.isUserActive)

    // const index = rooms.findIndex((room) => room.id === id);

    // if (index !== -1) return rooms.splice(index, 1)[0];
}