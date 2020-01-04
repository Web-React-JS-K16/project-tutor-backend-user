
// console.log("process env: ", process.env.NODE_ENV );
// exports.frontendUrl = process.env.NODE_ENV === 'production' ?
//         'https://tutor-front-end-user.herokuapp.com'
//         : 'http://localhost:3000';
// exports.frontendUrl = 'https://tutor-front-end-user.herokuapp.com'
exports.frontendUrl = 'http://localhost:3000'


exports.SOCKET_EMIT_SEND_MESSAGE = 'message'
exports.SOCKET_ON_RECIEVE_MESSAGE = 'message'

exports.SOCKET_ON_OPEN_ROOM = 'open room'
exports.SOCKET_EMIT_OPEN_ROOM = 'open room' // when server send request create a new room, client will accept

exports.SOCKET_ON_ACCEPT_NEW_ROOM = 'accept room' // send to server a request create a new room

exports.SOCKET_EMIT_ROOMATE_OFF = 'roomate off' // send to server a request create a new room

