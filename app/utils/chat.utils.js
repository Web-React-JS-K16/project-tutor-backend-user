const ChatModel = require('../models/chat.model');
const EUserType = require('../enums/EUserTypes');
const ObjectId = require('mongodb').ObjectID


// rooms contains user
let rooms = [];
let activeUserArr = []

/**
 * id as socket id
 */
exports.addUserToActiveList =  ({userId, socketId}) => {
    if (userId){
        const index = activeUserArr.findIndex(item => item.userId.toString() === userId.toString())
        // 1 user can connect socket with many socketId
        console.log("index in active list: ", index)
        console.log("socket id: ", socketId)
        if (index === -1){
            // add user to list
            activeUserArr.push({userId, socketId: [socketId]})
        } else if ( activeUserArr[index].socketId.indexOf(socketId.toString()) === -1) {
            // update socketId
            activeUserArr[index].socketId.push(socketId);
        }
        console.log("active list: ", activeUserArr);
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

exports.addRoomToActiveArr = ({room, members}) => {
    const index = rooms.findIndex(item => item.room === room);
    if (index !== -1) {
        return { error: "Phòng đã tồn tại." }
    } else {
        rooms.push({ room, members })
    }
}

exports.removeRoomFromActiveArr = (room) => {
    const index = rooms.findIndex(item => item.room === room);
    if (index !== -1) {
        rooms = rooms.splice(index, 1);
        console.log("room after remove: ", rooms);
    }
}


/**
 * When user online, get room chat to join
 * Only get active room (in orther to get realtime message)
 */
exports.getRoomChatForUser = async (userId, typeID) => {
    console.log("current room: ", rooms)
    let roomContainUser = [];
    if (typeID === EUserType.STUDENT){
        roomContainUser = await ChatModel.find({student: ObjectId(userId)})
    } else {
        roomContainUser = await ChatModel.find({teacher: ObjectId(userId)})
    }
    return roomContainUser;
}

exports.saveMessage = async ({room, newMessage}) => {
    try {
        await ChatModel.updateOne({ room}, {$push: { message: newMessage} });
        return {message: "Success"}
    } catch (err){
        return {error: err.message};
    }
}

exports.getRoomChatActiveContainUser = (userId) => {
    const result = rooms.filter(item => {
        // console.log("check index: ", item.members.indexOf(userId))
        // console.log("check userid: ", userId)
        // console.log("check members: ", item.members)
        return item.members.indexOf(userId)!== -1})  ;
    return result;  
}


/**
 * output: array room that need to send message that roomate is off
 */
exports.removeUser = (socketId) => {
    // check to delete user from active list
    const indexActive = activeUserArr.findIndex(item => item.socketId.indexOf(socketId)!==-1);
    if (indexActive === -1 ){
        return null;
    }

    if (activeUserArr[indexActive].socketId.length === 1) { // if this is the lastest socket of user
        // console.log("this is the last socket of user")
        const userId = activeUserArr[indexActive].userId;
        // delete user from active list
        activeUserArr = [...activeUserArr.slice(0, indexActive), ...activeUserArr.slice(indexActive+1)]
        // check to delete room if all member are not active
        const roomSendNotification = this.getRoomChatActiveContainUser(userId)
         // delete room from activeRoomArr if all members in this room are offline
        roomSendNotification.map(item => {
            if (!this.isUserActive(item.members[0] && this.isUserActive(item.members[1])))
            {
                this.removeRoomFromActiveArr(item.room)
            }
        })

        return { roomSendNotification, userId}; // to system send msg to this room that this user is off
    } else {
        // delete socketId from user active
        activeUserArr[indexActive].socketId.splice(activeUserArr[indexActive].socketId.indexOf(socketId), 1);
        return null;
    }
}