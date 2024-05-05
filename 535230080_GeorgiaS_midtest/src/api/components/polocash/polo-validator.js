const joi = require('joi');
const { joiPasswordExtendCore } = require('joi-password');
const joiPassword = joi.extend(joiPasswordExtendCore);

module.exports = {
  getBalance: {
    body: {
      pin: joiPassword.number().min(6).max(6).required().label('Pin'),
    },
  },

  createAccount: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(12)
        .required()
        .label('Password'),
      password_confirm: joi.string().required().label('Password confirmation'),
      pin: joiPassword
        .string()
        .minOfNumeric(6)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
      pin_confirm: joi.string().required().label('Pin confirmation'),
      balance: joi.number().required().label('Balance'),
    },
  },

  login: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(12)
        .required()
        .label('Password'),
    },
  },

  transfer: {
    body: {
      to_id: joi.string().required().label('to_id'),
      amount: joi.number().required().label('amount'),
      news: joi.string().label('news'),
      pin: joiPassword
        .string()
        .minOfNumeric(6)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },

  deleteAccount: {
    body: {
      password: joiPassword
        .string()
        .minOfLowercase(1)
        .minOfUppercase(1)
        .minOfNumeric(1)
        .noWhiteSpaces()
        .onlyLatinCharacters()
        .min(6)
        .max(12)
        .required()
        .label('Password'),
      deleted_id: joi.string().required().label('deleted_id'),
    },
  },

  getMutation: {
    body: {
      pin: joiPassword
        .string()
        .minOfNumeric(6)
        .min(6)
        .max(6)
        .required()
        .label('Pin'),
    },
  },
};
