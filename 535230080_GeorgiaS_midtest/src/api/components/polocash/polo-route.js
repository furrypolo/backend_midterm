const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const poloControllers = require('./polo-controller');
const poloValidator = require('./polo-validator');

const route = express.Router();

module.exports = (app) => {
  app.use('/polocash', route);

  //create new mbanking account
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(poloValidator.createAccount),
    poloControllers.createAccount
  );

  //login
  route.post('/login', celebrate(poloValidator.login), poloControllers.login);

  //getting account balance
  route.get(
    '/getBalance/:id',
    authenticationMiddleware,
    celebrate(poloValidator.getBalance),
    poloControllers.getBalance
  );

  //transfer (update account's balance)
  route.put(
    '/transfer/:id',
    authenticationMiddleware,
    celebrate(poloValidator.transfer),
    poloControllers.transfer
  );

  route.delete(
    '/deleteAcc/:id',
    authenticationMiddleware,
    celebrate(poloValidator.deleteAccount),
    poloControllers.deleteAccount
  );

  route.get(
    '/getMutation/:id',
    authenticationMiddleware,
    celebrate(poloValidator.getMutation),
    poloControllers.getMutation
  );
};
