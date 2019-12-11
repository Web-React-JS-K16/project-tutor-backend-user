const ObjectId = require('mongodb').ObjectID;
const Contract = require('../models/contract.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const UserTypes = require('../enums/EUserTypes');
const ContractTypes = require('../enums/EContractTypes');

// Retrieving and return all contracts
exports.getContractList = (req, res) => {
  var userId = req.query.id || '';

  User.findById({_id: ObjectId(userId)}).then(async user => {
      if (user) {
          if (user.typeID === UserTypes.TEACHER) {
            Contract.find({teacherId: ObjectId(user._id).populate('teacherId').populate('studentId').then(contractList => {
                res.status(200).send({
                    contract: contractList
                });
            }).catch(err => {
                console.log('error: ', err.message);
                res.status(500).send({
                  message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
                });
            })
            })
          } else if (user.typeID === UserTypes.STUDENT) {
            Contract.find({studentId: ObjectId(user._id).populate('teacherId').populate('studentId').then(contractList => {
                res.status(200).send({
                    contract: contractList
                });
            }).catch(err => {
                console.log('error: ', err.message);
                res.status(500).send({
                  message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
                });
            })
          })
      }
  }}).catch(err => {
    console.log('error: ', err.message);
    res.status(500).send({
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  });
};


/**
 * body: {_id} is contract's id
 */
exports.getContract = async (req, res) => {
  const { _id } = req.params;
  try {
    // console.log("user: ", user);
    if (user) {
      const contract = Contract.findOne({ _id });
      if (contract) {
        return res.status(200).send({ payload: contract });
      } else {
        return res.status(400).send({ message: 'Hợp đồng không tồn tại.' });
      }
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
    }
  } catch {
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.createContract = (req, res) => {
    const {studentId, teacherId} = req.body;

    if (studentId && teacherId) {
        const newContract = new Contract(req.body);
        newContract.save().then(contract => {
            res.status(200).send({
                contract
            });
        }).catch(err => {
            console.log('error: ', err.message);
            res.status(500).send({
              message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
            });
        });
    }
};
