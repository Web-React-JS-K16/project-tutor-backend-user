const ChatModel = require ('../models/chat.model')
const EUserType = require('../enums/EUserTypes');


exports.getAll = async (req, res) => {
    try {
    const {user}  = req
    let chatRoom= {}
    if (user.typeID === EUserType.STUDENT){
        chatRoom = await ChatModel.find({ student: user._id })
            .populate('student', { displayName: 1, avatar: 1 , typeID: 1})
            .populate('teacher', { displayName: 1, avatar: 1, typeID: 1})
    } else {
        chatRoom = await ChatModel.find({ teacher: user._id })
            .populate('student', { displayName: 1, avatar: 1, typeID: 1})
            .populate('teacher', { displayName: 1, avatar: 1, typeID: 1})
    }
    // console.log("get all chat room: ", chatRoom);
    return res.status(200).send({ payload: chatRoom });
} catch (err){
    console.log(err.message);
    return res.status(400).send({message: "Có lỗi xảy ra" });
}
}

exports.getDetail = async (req, res) => {
    try {
        const { room } = req.params
        console.log("room get detail: ", room)
         const result = await ChatModel.find({room})
                .populate('student', { passwordHash: 0, password: 0 })
                .populate('teacher', { passwordHash: 0, password: 0 })
        
        return res.status(200).send({ payload: result });
    } catch (err) {
        console.log(err.message);
        return res.status(400).send({ message: "Có lỗi xảy ra" });
    }

}
/**
 * Only student can create a new room chat
 */
exports.create = async (req, res) => {
    try {
        // const { user } = req
        const { room} = req.body;
        const existRoom = await ChatModel.findOne({room});
        console.log("is exist:", existRoom)

        if (!existRoom) {
            const newRoom = new ChatModel(req.body);
            await newRoom.save();

            const result = await ChatModel.findOne({room})
                .populate('student', { displayName: 1, avatar: 1, typeID: 1 })
                .populate('teacher', { displayName: 1, avatar: 1, typeID: 1 })
            return res.status(200).send({ payload: result });
        } else {
            return res.status(400).send({message: 'Phòng chat đã tồn tại' });

        }

    } catch (err) {
        console.log(err.message);
        return res.status(400).send({ message: "Có lỗi xảy ra" });
    }
}

