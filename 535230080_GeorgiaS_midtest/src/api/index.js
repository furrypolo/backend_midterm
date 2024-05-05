const express = require('express');

const authentication = require('./components/authentication/authentication-route');
const users = require('./components/users/users-route');
const polocash = require('./components/polocash/polo-route');

module.exports = () => {
  const app = express.Router();

  authentication(app);
  users(app);
  polocash(app);

  return app;
};
