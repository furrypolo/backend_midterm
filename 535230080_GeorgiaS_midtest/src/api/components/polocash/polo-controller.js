const poloService = require('./polo-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Handle creating account (create)
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createAccount(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const confirmPassword = request.body.password_confirm;
    const pin = request.body.pin;
    const confirmPin = request.body.pin_confirm;
    const balance = request.body.balance;
    if (password != confirmPassword) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Password confirmation mismatched'
      );
    }
    if (pin != confirmPin) {
      throw errorResponder(
        errorTypes.INVALID_PASSWORD,
        'Pin confirmation mismatched'
      );
    }
    const success = await poloService.createAccount(
      name,
      email,
      password,
      pin,
      balance
    );
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create user'
      );
    }

    return response.status(200).json({ name, email, balance });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  try {
    const name = request.body.name;
    const email = request.body.email;
    const password = request.body.password;
    const user = await poloService.findbyemail(email);
    if (!user) {
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'User not found');
    }
    if (user.attempt == 5) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'too much attempt, your account is blocked, please go to nearest bank'
      );
    }
    const check = await passwordMatched(password, user.password);
    const id = user.id;
    if (!check) {
      let attempt = user.attempt + 1;
      await poloService.updateAttempt(id, attempt);
      if (attempt == 5) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Wrong password, too much attempt, your account is blocked, please go to nearest bank'
        );
      }
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong password');
    }
    const success = await poloService.login(email);
    let attempt = 0;
    await poloService.updateAttempt(id, attempt);
    return response.status(200).json({ success });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle getting account's balance request (read)
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getBalance(request, response, next) {
  try {
    const id = request.params.id;
    const pin = request.body.pin;
    const user = await poloService.findbyid(id);
    if (user.attempt == 5) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'too much attempt, your account is blocked, please go to nearest bank'
      );
    }
    if (!(await passwordMatched(pin, user.pin))) {
      let attempt = user.attempt + 1;
      await poloService.updateAttempt(id, attempt);
      if (attempt == 5) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Wrong pin, too much attempt, your account is blocked, please go to nearest bank'
        );
      }
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }
    const balance = user.balance;
    let attempt = 0;
    await poloService.updateAttempt(id, attempt);
    const name = user.name;
    return response.status(200).json({ name, balance });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle transfer requests (update)
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function transfer(request, response, next) {
  try {
    const id = request.params.id;
    const to = request.body.to_id;
    const pin = request.body.pin;
    const amount = request.body.amount;
    let news;
    const user = await poloService.findbyid(id);
    const userto = await poloService.findbyid(to);
    if (user.attempt == 5) {
      throw errorResponder(
        errorTypes.FORBIDDEN,
        'too much attempt, your account is blocked, please go to nearest bank'
      );
    }
    if (!(await passwordMatched(pin, user.pin))) {
      let attempt = user.attempt + 1;
      await poloService.updateAttempt(id, attempt);
      if (attempt == 5) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Wrong pin, too much attempt, your account is blocked, please go to nearest bank'
        );
      }
      throw errorResponder(errorTypes.INVALID_CREDENTIALS, 'Wrong pin');
    }
    attempt = 0;
    await poloService.updateAttempt(id, attempt);
    if (request.body.news == null) {
      news = '';
    } else {
      news = request.body.news;
    }
    if (userto == null) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Destination account not found'
      );
    }
    if (user.balance < amount) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Not enough balance'
      );
    }

    let balance = user.balance - amount;
    const tobalance = userto.balance + amount;
    const successmin = await poloService.updateBalance(id, balance);
    if (!successmin) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to transfer'
      );
    }
    const successto = await poloService.updateBalance(to, tobalance);
    if (!successto) {
      balance = user.balance + amount;
      await poloService.updateBalance(id, balance);
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to transfer'
      );
    }
    const message = 'transfer suceeded';
    const from = id;
    await poloService.addHistory(from, to, amount, news);
    return response.status(200).json({ message, from, to, news, balance });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle account deleting request (for admins only)(delete)
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteAccount(request, response, next) {
  try {
    const adminid = '663730bc1fabcdb5dff1f71f';
    const id = request.params.id;
    const delid = request.body.deleted_id;
    const password = request.body.password;
    if (adminid != id) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Sorry, only administrator can delete accounts'
      );
    }
    const admin = await poloService.findbyid(adminid);
    if (!passwordMatched(password, admin.password)) {
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Wrong password');
    }
    const account = await poloService.findbyid(delid);
    if (!account) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Account not found'
      );
    }
    const success = await poloService.deleteAccount(delid);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete account'
      );
    }
    const msg = 'Account deleted';
    return response.status(200).json({ msg });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle getting account's mutation request (read)
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getMutation(request, response, next) {
  try {
    const id = request.params.id;
    const pin = request.body.pin;
    const user = await poloService.findbyid(id);
    if (user.attempt == 5) {
      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Too much attempt, your account is blocked, please go to nearest bank'
      );
    }
    if (!(await passwordMatched(pin, user.pin))) {
      let attempt = user.attempt + 1;
      await poloService.updateAttempt(id, attempt);
      if (attempt == 5) {
        throw errorResponder(
          errorTypes.INVALID_CREDENTIALS,
          'Wrong pin, too much attempt, your account is blocked, please go to nearest bank'
        );
      }
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Wrong pin');
    }
    attempt = 0;
    await poloService.updateAttempt(id, attempt);
    const mutation = await poloService.getHistory(id);
    return response.status(200).json({ mutation });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAccount,
  login,
  getBalance,
  transfer,
  deleteAccount,
  getMutation,
};
