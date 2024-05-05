const poloRepository = require('./polo-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { generateToken } = require('../../../utils/session-token');

async function createAccount(name, email, password, pin, balance) {
  const hashedPassword = await hashPassword(password);
  const hashedPin = await hashPassword(pin);
  const attempt = 0;
  try {
    await poloRepository.createAccount(
      name,
      email,
      hashedPassword,
      hashedPin,
      balance,
      attempt
    );
  } catch (err) {
    return false;
  }
  return true;
}

async function findbyemail(email) {
  return await poloRepository.findbyemail(email);
}

async function findbyid(id) {
  return await poloRepository.findbyid(id);
}

async function login(email) {
  const user = await poloRepository.findbyemail(email);
  return {
    email: user.email,
    name: user.name,
    user_id: user.id,
    token: generateToken(user.email, user.id),
  };
}

async function updateAttempt(id, balance) {
  return await poloRepository.updateAttempt(id, balance);
}

async function updateBalance(id, balance) {
  return await poloRepository.updateBalance(id, balance);
}

async function addHistory(from, to, amount, news) {
  const today = new Date();
  poloRepository.addHistory(today, from, to, amount, news);
}

async function deleteAccount(id) {
  return await poloRepository.deleteAccount(id);
}

async function getHistory(id) {
  const histories = await poloRepository.getHistory();
  const mutation = [];
  for (let i = 0; i < histories.length; i++) {
    const hist = histories[i];
    console.log(hist.from);
    if (hist.from == id || hist.to == id) {
      let fromid = hist.from;
      let toid = hist.to;
      const from = await findbyid(fromid);
      const to = await findbyid(toid);
      if (from == null && to == null) {
        mutation.push({
          date: hist.date,
          from: fromid,
          to: toid,
          amount: hist.amount,
          news: hist.news,
        });
      } else if (from == null) {
        mutation.push({
          date: hist.date,
          from: fromid,
          to: to.name,
          amount: hist.amount,
          news: hist.news,
        });
      } else if (to == null) {
        mutation.push({
          date: hist.date,
          from: from.name,
          to: toid,
          amount: hist.amount,
          news: hist.news,
        });
      } else {
        mutation.push({
          date: hist.date,
          from: from.name,
          to: to.name,
          amount: hist.amount,
          news: hist.news,
        });
      }
    }
  }
  return mutation;
}

module.exports = {
  createAccount,
  findbyemail,
  findbyid,
  login,
  updateAttempt,
  updateBalance,
  addHistory,
  deleteAccount,
  getHistory,
};
