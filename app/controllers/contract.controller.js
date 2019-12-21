const ObjectId = require('mongodb').ObjectID;
const Contract = require('../models/contract.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const Report = require('../models/report.model');
const Notification = require('../models/notification.model');
const UserTypes = require('../enums/EUserTypes');
const ContractTypes = require('../enums/EContractTypes');
const DefaultValues = require('../utils/default-values.utils');
const formatCostHelper = require('../helpers/format-cost.helper');
const paymentUtils = require('../utils/payment.utils');

// Retrieving and return all contracts
exports.getContractList = (req, res) => {
  var userId = req.query.userId || '';
  var pageNumber = req.query.page || DefaultValues.pageNumber;
  var itemPerPage = req.query.limit || DefaultValues.itemPerPage;
  var status = req.query.status || DefaultValues.contractType;

  if (isNaN(pageNumber) || pageNumber < 1) {
    pageNumber = DefaultValues.pageNumber;
  } else {
    pageNumber = parseInt(pageNumber);
  }
  if (isNaN(itemPerPage) || itemPerPage < 1) {
    itemPerPage = DefaultValues.itemPerPage;
  } else {
    itemPerPage = parseInt(itemPerPage);
  }
  if (isNaN(status)) {
    status = DefaultValues.contractType;
  } else {
    status = parseInt(status);
  }

  User.findById({ _id: ObjectId(userId) })
    .then(async user => {
      if (user) {
        if (user.typeID === UserTypes.TEACHER) {
          // build query for teacher
          var queryTeacher = {};
          queryTeacher['teacherId'] = ObjectId(user._id);
          if (status === DefaultValues.contractType) {
            // all
            queryTeacher['status'] = { $ne: ContractTypes.WAIT_FOR_PAYMENT };
          } else {
            queryTeacher['status'] = status;
          }

          Contract.find(queryTeacher)
            .skip(itemPerPage * (pageNumber - 1))
            .limit(itemPerPage)
            .then(contractList => {
              res.status(200).send({
                contract: contractList
              });
            })
            .catch(err => {
              console.log('error: ', err.message);
              res.status(500).send({
                message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
              });
            });
        } else if (user.typeID === UserTypes.STUDENT) {
          // build query for student
          var queryStudent = {};
          queryStudent['studentId'] = ObjectId(user._id);
          if (status !== DefaultValues.contractType) {
            queryStudent['status'] = status;
          }

          Contract.find(queryStudent)
            .skip(itemPerPage * (pageNumber - 1))
            .limit(itemPerPage)
            .then(contractList => {
              res.status(200).send({
                contract: contractList
              });
            })
            .catch(err => {
              console.log('error: ', err.message);
              res.status(500).send({
                message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
              });
            });
        }
      } else {
        return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
      }
    })
    .catch(err => {
      console.log('error: ', err.message);
      res.status(500).send({
        message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
      });
    });
};

exports.countContracts = async (req, res) => {
  var userId = req.query.userId || '';
  var status = req.query.status || DefaultValues.contractType;

  if (isNaN(status)) {
    status = DefaultValues.contractType;
  } else {
    status = parseInt(status);
  }

  User.findById({ _id: ObjectId(userId) })
    .then(async user => {
      if (user) {
        if (user.typeID === UserTypes.TEACHER) {
          // build query for teacher
          var queryTeacher = {};
          queryTeacher['teacherId'] = ObjectId(user._id);
          if (status === DefaultValues.contractType) {
            // all
            queryTeacher['status'] = { $ne: ContractTypes.WAIT_FOR_PAYMENT };
          } else {
            queryTeacher['status'] = status;
          }

          Contract.countDocuments(queryTeacher)
            .then(quantity => {
              res.status(200).send({
                contract: quantity
              });
            })
            .catch(err => {
              console.log('error: ', err.message);
              res.status(500).send({
                message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
              });
            });
        } else if (user.typeID === UserTypes.STUDENT) {
          // build query for student
          var queryStudent = {};
          queryStudent['studentId'] = ObjectId(user._id);
          if (status !== DefaultValues.contractType) {
            queryStudent['status'] = status;
          }

          Contract.countDocuments(queryStudent)
            .then(quantity => {
              res.status(200).send({
                contract: quantity
              });
            })
            .catch(err => {
              console.log('error: ', err.message);
              res.status(500).send({
                message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
              });
            });
        }
      } else {
        return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
      }
    })
    .catch(err => {
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
  const { id } = req.params;
  const { user } = req;
  try {
    if (user) {
      const contract = await Contract.findOne({ _id: id });

      if (contract) {
        // get user, city and district
        const teacher = await User.findById(contract.teacherId, {
          passwordHash: 0,
          password: 0
        })
          .populate('city')
          .populate('district');
        const student = await User.findById(contract.studentId, {
          passwordHash: 0,
          password: 0
        })
          .populate('city')
          .populate('district');

        if (
          contract.teacherId._id.toString() === user._id.toString() ||
          contract.studentId._id.toString() === user._id.toString()
        ) {
          // get comment of contract
          const commentData = await Comment.find({
            contract: ObjectId(contract._id)
          });
          const {
            teacherId,
            studentId,
            costPerHour,
            workingHour,
            ...other
          } = contract;
          const contractInfo = other._doc;

          // format cost
          let formatCostPerHour = formatCostHelper(
            costPerHour.toString() + '000'
          );
          let formatCost = formatCostHelper(
            (parseInt(costPerHour.toString()) * workingHour).toString() + '000'
          );

          return res.status(200).send({
            payload: {
              ...contractInfo,
              teacherId: teacher,
              studentId: student,
              comment: commentData[0],
              costPerHour: formatCostPerHour,
              cost: formatCost // total cost
            }
          });
        }
        return res.status(400).send({ message: 'Bạn không có quyền truy cập' });
      } else {
        return res.status(400).send({ message: 'Hợp đồng không tồn tại.' });
      }
    } else {
      return res.status(400).send({ message: 'Tài khoản không tồn tại.' });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ message: 'Đã có lỗi xảy ra, vui lòng thử lại!' });
  }
};

exports.createContract = (req, res) => {
  const { studentId, teacherId } = req.body;

  if (studentId && teacherId) {
    const newContract = new Contract(req.body);
    newContract
      .save()
      .then(contract => {
        res.status(200).send({
          contract
        });
      })
      .catch(err => {
        console.log('error: ', err.message);
        res.status(500).send({
          message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
        });
      });
  }
};

/**
 * student report about contract
 * body: {contractId, content}
 * Note: do not have to check userId in contract because it was checked in step get contract detail
 */
exports.sendReport = async (req, res) => {
  const { contractId, content } = req.body;
  const { user } = req;
  try {
    if (user) {
      const report = new Report();
      report.content = content;
      report.contract = contractId;
      await report.save();

      // TODO: send report about contract for teacher ??

      return res
        .status(200)
        .send({ isSuccess: true, message: 'Gửi tố cáo thành công' });
    } else {
      return res
        .status(400)
        .send({ isSuccess: false, message: 'Tài khoản không tồn tại.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      isSuccess: false,
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

/**
 * teacher approval contract
 * input: {id} as idContract
 */
exports.approveContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    if (user) {
      const contract = await Contract.findById(ObjectId(id)).populate(
        'teacherId'
      );
      if (contract) {
        if (contract.status === ContractTypes.IS_VALID) {
          return res.status(400).send({
            isSuccess: true,
            message: 'Hợp đồng đã có hiệu lực trước đó.'
          });
        }
        // update contract status
        await Contract.updateOne(
          { _id: ObjectId(id) },
          { $set: { status: ContractTypes.IS_VALID, startDate: new Date() } }
        );
        // console.log("resutl: ", restult);
        // create new notification to student
        const notification = new Notification();
        notification.content = `Hợp đồng ${contract.name} với giáo viên ${contract.teacherId.displayName} đã được chấp nhận.`;
        notification.link = `/contract-detail/${contract._id}`;
        notification.userId = contract.studentId;
        await notification.save();

        return res
          .status(200)
          .send({ isSuccess: true, message: 'Cập nhật thành công' });
      } else {
        return res
          .status(400)
          .send({ isSuccess: true, message: 'Hợp đồng không tồn tại' });
      }
    } else {
      return res
        .status(400)
        .send({ isSuccess: false, message: 'Tài khoản không tồn tại.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      isSuccess: false,
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

/**
 * teacher/ teacher cancel contract
 * input: {id} as idContract
 */
exports.cancelContract = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;
    if (user) {
      const contract = await Contract.findById(ObjectId(id))
        .populate('teacherId')
        .populate('studentId');
      if (contract) {
        // update contract status
        await Contract.updateOne(
          { _id: ObjectId(id) },
          { $set: { status: ContractTypes.IS_CANCELLED, endDate: new Date() } }
        );

        // create new notification to student
        const notification = new Notification();
        let content = '';
        let receiver = '';
        if (user.typeID === UserTypes.TEACHER) {
          // send notification for student
          content = `Hợp đồng ${contract.name} đã bị hủy bởi giáo viên ${contract.teacherId.displayName}.`;
          receiver = contract.studentId;
        } else {
          // send notification for teacher
          content = `Hợp đồng ${contract.name} đã bị hủy bởi học sinh ${contract.studentId.displayName}.`;
          receiver = contract.teacherId;
        }
        notification.link = `/contract-detail/${contract._id}`;
        notification.userId = receiver;
        notification.content = content;

        await notification.save();

        return res
          .status(200)
          .send({ isSuccess: true, message: 'Hợp đồng đã bị hủy' });
      } else {
        return res
          .status(400)
          .send({ isSuccess: true, message: 'Hợp đồng không tồn tại' });
      }
    } else {
      return res
        .status(400)
        .send({ isSuccess: false, message: 'Tài khoản không tồn tại.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      isSuccess: false,
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

/**
 * Student comment and rate contract
 * input: {comment, rating, token as token of student, id as contractId}
 */
exports.ratingContract = async (req, res) => {
  try {
    const { id, comment, rating } = req.body;
    const { user } = req;
    if (user) {
      const contract = await Contract.findById(ObjectId(id)).populate(
        'studentId'
      );
      if (contract) {
        // update contract status
        const newComment = { time: new Date(), content: comment };
        await Contract.updateOne(
          { _id: ObjectId(id) },
          { $set: { rating, comment: newComment } }
        );

        // create new notification to student
        const notification = new Notification();
        // send notification for teacher
        notification.link = `/contract-detail/${contract._id}`;
        notification.userId = contract.teacherId;
        notification.content = `${contract.studentId.displayName} đã thêm đánh giá và bình luận cho hợp đồng ${contract.name}.`;
        await notification.save();

        return res
          .status(200)
          .send({ message: 'Thêm đánh giá thành công', comment: newComment });
      } else {
        return res.status(400).send({ message: 'Hợp đồng không tồn tại' });
      }
    } else {
      return res
        .status(400)
        .send({ isSuccess: false, message: 'Tài khoản không tồn tại.' });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({
      message: 'Đã có lỗi xảy ra, vui lòng thử lại!'
    });
  }
};

exports.test = async (req, res) => {
  const { id } = req.params;
  await Contract.updateOne(
    { _id: ObjectId(id) },
    { $set: { status: ContractTypes.IS_VALID } }
  );
};


exports.afterPayment = async (req, res) => {
  console.log("after payment");
};

const stripe = require("stripe")("sk_test_dqIlz6bjhuSeinyYEoCStwjy00q2DMnRHT");
exports.testPay =  async (req, res) => {
  const { stripeToken, amount } = req.body
  console.log("req.body: ", req.body)
  // console.log("req.body: ", req.body)
  try {
    let result = await stripe.charges.create({
      amount: amount,
      currency: "vnd",
      description: "An example charge 111",
      // source: {token: stripeToken}
      source: stripeToken
    });

    console.log("result: ", result);

    const { status } = result;

    res.json({ status });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}