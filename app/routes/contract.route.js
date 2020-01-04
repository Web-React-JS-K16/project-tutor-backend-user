const express = require('express');
const app = express();
const contractController = require('../controllers/contract.controller');
const passport = require('passport');
const userUtils = require('../utils/user.utils');
const EUserType = require('../enums/EUserTypes');

app.post('/contract-create-test', contractController.createTest);

// Retrieve all contracts
app.get('/contract', contractController.getContractList);
app.get('/contract/quantity', contractController.countContracts);

app.get(
  '/contract/list-for-teacher',
  contractController.getContractListForTeacherPage
);
app.get(
  '/contract/quantity-for-teacher',
  contractController.countContractsForTeacherPage
);

// get contract detail
app.get(
  '/contract/get-detail/:id',
  passport.authenticate('jwt', { session: false }),
  contractController.getContract
);

app.post('/contract/create', contractController.createContract);
app.post(
  '/contract/report',
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.STUDENT),
  contractController.sendReport
);

/**
 * teacher approval contract
 * input: {id} as idContract
 */
app.put(
  '/contract/approve/:id',
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.TEACHER),
  contractController.approveContract
);

/**
 * teacher/ teacher cancel contract
 * input: {id} as idContract
 */
// app.put(
//   '/contract/cancel/:id',
//   passport.authenticate('jwt', { session: false }),
//   contractController.cancelContract
// );

app.put(
  '/contract/finish',
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.STUDENT),
  contractController.finishContract
);

/**
 * Student comment and rate contract
 * input: {comment, rating, token as token of student, id as contractId}
 */
app.put(
  '/contract/update-rating',
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.STUDENT),
  contractController.updateRatingContract
);

// app.test('/contract/test',
//   contractController.set);

app.post(
  '/contract/charge',
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.STUDENT),
  contractController.chargeContract
);

app.get('/contract/test', contractController.createTest);

app.get('/contract/delete', contractController.deleteAll);

module.exports = app;
