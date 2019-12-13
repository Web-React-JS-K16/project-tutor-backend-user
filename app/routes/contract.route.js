const express = require('express');
const app = express();
const contractController = require('../controllers/contract.controller');
const passport = require('passport');
const userUtils = require('../utils/user.utils');
const EUserType = require('../enums/EUserTypes');

// Retrieve all contracts
app.get('/contract', contractController.getContractList);
app.get('/contract/quantity', contractController.countContracts);
// get contract detail
app.get(
  '/contract/:id',
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
app.put('/contract/approve/:id', 
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.TEACHER),
  contractController.approveContract);

/**
* teacher/ teacher cancel contract
* input: {id} as idContract
*/
app.put('/contract/cancel/:id',
  passport.authenticate('jwt', { session: false }),
  contractController.cancelContract);

/**
* Student comment and rate contract
* input: {comment, rating, token as token of student, id as contractId}
*/
app.put('/contract/rating',
  passport.authenticate('jwt', { session: false }),
  userUtils.checkRole(EUserType.STUDENT),
  contractController.ratingContract);

// app.test('/contract/set/:id',
//   contractController.set);
module.exports = app;
