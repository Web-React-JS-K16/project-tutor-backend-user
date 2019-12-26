const ObjectId = require('mongodb').ObjectID;
const Contract = require('../models/contract.model');
const Comment = require('../models/comment.model');
const User = require('../models/user.model');
const Teacher = require('../models/teacher.model');
const Report = require('../models/report.model');
const Notification = require('../models/notification.model');
const UserTypes = require('../enums/EUserTypes');
const ContractTypes = require('../enums/EContractTypes');
const DefaultValues = require('../utils/default-values.utils');
const formatCostHelper = require('../helpers/format-cost.helper');
const paymentUtils = require('../utils/payment.utils');
const contractUtils = require('../utils/contract.utils');
const EContractTypes = require('../enums/EContractTypes');
const ISODate = require('mongodb').ISODate;

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

exports.getContractListForTeacherPage = (req, res) => {
  var userId = req.query.userId || '';
  var pageNumber = req.query.page || DefaultValues.pageNumber;
  var itemPerPage = req.query.limit || DefaultValues.itemPerPage;

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

  User.findById({ _id: ObjectId(userId) })
    .then(async user => {
      if (user) {
        if (user.typeID === UserTypes.TEACHER) {
          Contract.find({
            teacherId: ObjectId(user._id),
            status: {
              $in: [
                ContractTypes.IS_CANCELLED,
                ContractTypes.IS_COMPLETED_BY_ADMIN
              ]
            }
          })
            .skip(itemPerPage * (pageNumber - 1))
            .limit(itemPerPage)
            .then(async contractsData => {
              var contracts = [];
              for (data of contractsData) {
                // get comment of contract
                const commentData = await Comment.find({
                  contract: ObjectId(data._id)
                });

                // get contract
                const {
                  _id,
                  name,
                  status,
                  isPaid,
                  content,
                  teacherId,
                  studentId,
                  startDate,
                  endDate,
                  costPerHour,
                  workingHour
                } = data;
                let formatCostPerHour = formatCostHelper(
                  costPerHour.toString() + '000'
                );
                let formatCost = formatCostHelper(
                  (parseInt(costPerHour.toString()) * workingHour).toString() +
                    '000'
                );
                contracts.push({
                  _id,
                  name,
                  status,
                  isPaid,
                  content,
                  teacherId,
                  studentId,
                  startDate,
                  endDate,
                  costPerHour: formatCostPerHour,
                  cost: formatCost,
                  workingHour,
                  comment: commentData[0]
                });
              }
              res.status(200).send({
                payload: contracts
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

exports.countContractsForTeacherPage = async (req, res) => {
  var userId = req.query.userId || '';

  User.findById({ _id: ObjectId(userId) })
    .then(async user => {
      if (user) {
        if (user.typeID === UserTypes.TEACHER) {
          Contract.countDocuments({
            teacherId: ObjectId(user._id),
            status: {
              $in: [
                ContractTypes.IS_CANCELLED,
                ContractTypes.IS_COMPLETED_BY_ADMIN
              ]
            }
          })
            .then(quantity => {
              res.status(200).send({
                payload: quantity
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
          // teacher cannot see contract detail when status contract is WAIT_FOR_PAY_MENT
          if (
            user.typeID === UserTypes.TEACHER &&
            contract.status === ContractTypes.WAIT_FOR_PAYMENT
          ) {
            return res
              .status(400)
              .send({ message: 'Bạn không có quyền truy cập' });
          }
          // get comment of contract
          console.log('contract id: ', contract._id);
          const commentData = await Comment.findOne({
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
              comment: commentData,
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
  const { studentId, teacherId, tags } = req.body;

  if (studentId && teacherId) {
    const contractTags = tags.map(tagId => {
      return { _id: ObjectId(tagId) };
    });
    req.body.tags = contractTags;

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

      // *Note: not updat status, admin will do it
      // update contract status -> IS_CANCELLED
      // await Contract.updateOne({_id: ObjectId(contractId)}, {
      //   status: EContractTypes.IS_CANCELLED,
      //   $push: { statusHistory: { time: new Date(), status: EContractTypes.IS_CANCELLED }}
      // })

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
 * Student finish contract
 */
exports.finishContract = async (req, res) => {
  try {
    console.log('req.body: ', req.body);
    const {
      contractId,
      comment: { content, ratings }
    } = req.body;
    const { user } = req;
    if (user) {
      const contract = await Contract.findById(ObjectId(contractId)).populate(
        'studentId'
      );
      // .populate('teacherId');

      if (contract) {
        // update teacher: jobs, workHour, (ratings) + comment
        if (ratings > 0) {
          const newRating = await contractUtils.getUpdatedRating(
            ratings,
            contract.teacherId,
            contractId
          );
          console.log('before update');
          console.log('contract.teacherId:  ', contract.teacherId);
          console.log('contract.teacherId:  ', +newRating);
          console.log('contract.teacherId:  ', contract.teacherId);
          await Teacher.findOneAndUpdate(
            { userId: ObjectId(contract.teacherId) },
            {
              ratings: +newRating,
              $inc: { hoursWorked: +contract.workingHour, jobs: 1 }
            }
          );
          console.log('after update');

          const newComment = new Comment({
            content,
            ratings,
            contract: ObjectId(contractId)
          });
          await newComment.save();
        } else {
          await Teacher.updateOne(
            { _id: ObjectId(contract.teacherId) },
            {
              $inc: { hoursWorked: contract.workingHour, jobs: 1 }
            }
          );
          if (content) {
            const newComment = new Comment({ content, ratings: 0 });
            await newComment.save();
          }
        }
        // create new notification to teacher
        const notification = new Notification();
        // send notification for teacher
        notification.link = `/contract-detail/${contract._id}`;
        notification.userId = contract.teacherId;
        notification.content = `Học sinh ${contract.studentId.displayName} đã kết thúc hợp đồng ${contract.name}.`;
        await notification.save();

        // update contract status
        await Contract.updateOne(
          { _id: ObjectId(contractId) },
          {
            status: EContractTypes.IS_COMPLETED_BY_STUDENT,
            $push: {
              statusHistory: {
                time: new Date(),
                status: EContractTypes.IS_COMPLETED_BY_STUDENT
              }
            }
          }
        );
        return res
          .status(200)
          .send({ message: 'Cập nhật trạng thái hợp đồng thành công' });
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

/**
 * Student comment and rate contract
 * input: {comment, rating, token as token of student, id as contractId}
 */
exports.updateRatingContract = async (req, res) => {
  try {
    const { id, content, ratings } = req.body;
    const { user } = req;
    if (user) {
      const contract = await Contract.findById(ObjectId(id)).populate(
        'studentId'
      );
      if (contract) {
        // update comment + ratings
        const oldCommnet = await Comment.findOne({ contract: ObjectId(id), ratings: { $gt: 0 } });
        
        // only update rating when rating > 0 and (oldComment not exist ||  different old ratings )
        if (ratings > 0 && (!oldCommnet || ratings !== oldCommnet.ratings)){ 
          // update rating for teacher
          const newRating = await contractUtils.getUpdatedRating(
            ratings,
            contract.teacherId,
            id
          );

          // update teacher's ratings
          await Teacher.updateOne(
            { userId: contract.teacherId },
            {
              $set: {
                ratings: newRating
              }
            }
          );
          // update new comment
          await Comment.updateOne(
            { contract: ObjectId(id) },
            { $set: { ratings, content, date: new Date() } }
          );
        } else {
          await Comment.updateOne(
            { contract: ObjectId(id) },
            { $set: { content, date: new Date() } }
          );
        }

        // create new notification to student
        const notification = new Notification();
        // send notification for teacher
        notification.link = `/contract-detail/${contract._id}`;
        notification.userId = contract.teacherId;
        notification.content = `${contract.studentId.displayName} đã cập nhật đánh giá và bình luận cho hợp đồng ${contract.name}.`;
        await notification.save();

        return res.status(200).send({ message: 'Thêm đánh giá thành công' });
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

// exports.test = async (req, res) => {
//   const { id } = req.params;
//   await Contract.updateOne(
//     { _id: ObjectId(id) },
//     { $set: { status: ContractTypes.IS_VALID } }
//   );
// };

/**
 * Student charge contract (payment)
 */
const stripe = require('stripe')('sk_test_dqIlz6bjhuSeinyYEoCStwjy00q2DMnRHT');
exports.chargeContract = async (req, res) => {
  const { stripeToken, amount, contractId } = req.body;
  try {
    const contract = await Contract.findOne({ _id: ObjectId(contractId) });
    const { teacherId, status, costPerHour, workingHour, name } = contract;

    if (status != EContractTypes.WAIT_FOR_PAYMENT) {
      return res
        .status(400)
        .send({ message: 'Hợp đồng đã được thanh toán trước đó' });
    }

    if (amount !== costPerHour * workingHour * 1000) {
      return res
        .status(400)
        .send({ message: 'Số tiền không đúng. Vui lòng thử lại' });
    }

    let result = await stripe.charges.create({
      amount: amount,
      currency: 'vnd',
      description: '',
      source: stripeToken
    });
    if (result.status === 'succeeded') {
      // update db
      //TODO
      // await Contract.findOneAndUpdate({ _id: ObjectId(contractId) },
      //    status: EContractTypes.WAIT_FOR_ACCEPTANCE,
      //    { $push: { statusHistory: { time: new Date(), status: EContractTypes.WAIT_FOR_ACCEPTANCE } } }
      // )

      await Contract.updateOne(
        { _id: ObjectId(contractId) },
        { $set: { status: EContractTypes.WAIT_FOR_ACCEPTANCE } }
      );
      await Contract.updateOne(
        { _id: ObjectId(contractId) },
        {
          $push: {
            statusHistory: {
              time: new Date(),
              status: EContractTypes.WAIT_FOR_ACCEPTANCE
            }
          }
        }
      );
      // send notification
      const notification = new Notification({
        userId: teacherId,
        content: `Bạn có 1 hợp đồng ${name} mới.`,
        link: `/contract-detail/${contractId}`
      });
      await notification.save();

      return res.status(200).send({ message: 'Thanh toán thành công' });
    } else {
      return res.status(400).send({ message: 'Thanh toán thất bại' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
};

// exports.testContract = async (req, res) => {
//   console.log("on test contract")
//   await Contract.updateOne(
//     { _id: ObjectId('5df10a84e7c6b8f83eda3984') },
//     { $set: { status: EContractTypes.WAIT_FOR_ACCEPTANCE } },
//     { $push: { statusHistory: { time: new Date(), status: EContractTypes.WAIT_FOR_ACCEPTANCE } } }
//   );
//       return res.status(400).send({ message: 'Thanh toán thất bại' });
// };

exports.createTest = async (req, res) => {
  // console.log("on test")
  // const result = await Contract.findOne({ _id: ObjectId('5df10a84e7c6b8f83eda3984') });
  // console.log(result);
  // const test = JSON.stringify(result);

  // const finalDate = req.body.statusHistory[4].time;
  // console.log("finaldate: ", finalDate);
  // const endDate = new Date(finalDate.toString());
  const data = req.body;

  let payload = [];
  await data.map(async item => {
    console.log('item: ', item);
    const { tags } = item;
    const newTags = tags.map(item => {
      const _id = item;
      return { _id: ObjectId(_id) };
    });

    const startDate = new Date(item.statusHistory[0].time.toString());
    // const startDate = 

    // console.log("enddate: ", endDate)
    const rs = await new Contract({ ...item, startDate, tags: newTags });
    await rs.save();
    // console.log("on push: ", rs);
    payload.push(rs);
  });

  const count = await Contract.countDocuments();

  return res.status(200).send({ isSuccess: false, count });
  // return res.status(500).send({ isSuccess: false });
};

const City = require('../models/city.model');
const District = require('../models/district.model');

exports.deleteAll = async (req, res) => {

  // await Teacher.updateMany({about: null}, {
  // about: "Là giáo viên có nhiều năm kinh nghiệm."
  // })
  const tag = ObjectId(req.body.tags[0]._id)
  const a = new Contract({...req.body, tags: [{_id: tag}]});
  await a.save();

  return res.status(200).send({ isSuccess: false, a });
};
