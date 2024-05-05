const mongoose = require('mongoose');
const config = require('../core/config');
const logger = require('../core/logger')('app');

const usersSchema = require('./users-schema');
const polousersSchema = require('./polousers-schema');
const historySchema = require('./history-schema');

mongoose.connect(`${config.database.connection}/${config.database.name}`, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once('open', () => {
  logger.info('Successfully connected to MongoDB');
});

const User = mongoose.model('users', mongoose.Schema(usersSchema));
const polousers = mongoose.model('polousers', mongoose.Schema(polousersSchema));
const history = mongoose.model('history', mongoose.Schema(historySchema));

module.exports = {
  mongoose,
  User,
  polousers,
  history,
};
