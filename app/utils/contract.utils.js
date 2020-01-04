const Comment = require('../models/comment.model');
const Teacher = require('../models/teacher.model');
const ObjectId = require('mongodb').ObjectID;



exports.getSumJobRatedForTeacher = async (teacherId) => {
    const result = await Comment.aggregate([
        {
            $match:
            {
                ratings: {$gt: 0}
            }
        },
        {
            $lookup: {
                from: "contracts",
                localField: "contract",
                foreignField: "_id",
                as: "contract"
            }
        },
        {
            $match: {
                "contract.teacherId": { $eq: teacherId}
            }    
        }
    ])
    console.log("result count: ", result.length);
    return result.length;
}


exports.getUpdatedRating = async ( newContractRating, teacherId, contractId ) =>{
    const sumJobRated = await this.getSumJobRatedForTeacher(teacherId)
    // get teacher's rating everage
    const teacher = await Teacher.findOne({ userId: teacherId }, { ratings: 1});
    const oldEverageRating = teacher.ratings;
    // get old rating of contract
    const oldCommnet = await Comment.findOne({ contract: ObjectId(contractId), ratings: { $gt: 0 } });
    
    let newRating = oldEverageRating;
    if (oldCommnet) {
        const oldContractRating = oldCommnet.ratings;
        newRating = ((oldEverageRating * sumJobRated - oldContractRating) + newContractRating) / sumJobRated;
        
    } else {
        newRating = ((oldEverageRating * sumJobRated + newContractRating) / (sumJobRated + 1))
    }

    console.log("new rating: ", newRating)
    return newRating;
}

// exports.getNewRating = (oldEverageRating, newContractRating, sumJobRated) => {
//     const newRating = ((oldEverageRating * sumJobRated + newContractRating) / (sumJobRated +1))
//     return newRating;
// }