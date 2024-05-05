const { polousers, history } = require('../../../models');

async function createAccount(
  name,
  email,
  hashedPassword,
  hashedPin,
  balance,
  attempt
) {
  const password = hashedPassword;
  const pin = hashedPin;
  const success = await polousers.create({
    name,
    email,
    password,
    pin,
    balance,
    attempt,
  });

  console.log(success);
  return success;
}

async function findbyemail(email) {
  return polousers.findOne({ email });
}

async function findbyid(id) {
  return polousers.findById(id);
}

async function updateAttempt(id, attempt) {
  return polousers.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        attempt,
      },
    }
  );
}

async function updateBalance(id, balance) {
  return polousers.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        balance,
      },
    }
  );
}

async function addHistory(date, from, to, amount, news) {
  const success = await history.create({
    date,
    from,
    to,
    amount,
    news,
  });
  return success;
}

async function deleteAccount(id) {
  return await polousers.deleteOne({ _id: id });
}

async function getHistory() {
  try {
    return history.find({});
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAccount,
  findbyemail,
  findbyid,
  updateAttempt,
  updateBalance,
  addHistory,
  deleteAccount,
  getHistory,
};
