const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');
const { errorResponder, errorTypes } = require('../../../core/errors');
const { boolean } = require('joi');

/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers(
  page,
  size,
  searchField,
  searchKey,
  filterField,
  filterKey
) {
  try {
    const users = await usersRepository.getUsers();
    const filter1 = [];
    if (searchField == 'name') {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const name = users[i].name;
        if (name.toLowerCase().includes(searchKey)) {
          filter1.push({
            id: user.id,
            name: user.name,
            email: user.email,
          });
        }
      }
    } else if (searchField == 'email') {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const email = users[i].email;
        if (email.toLowerCase().includes(searchKey)) {
          filter1.push({
            id: user.id,
            name: user.name,
            email: user.email,
          });
        }
      }
    } else {
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        filter1.push({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      }
    }

    if (filterField == 'name') {
      if (filterKey == 'desc') {
        filter1.sort(function (a, b) {
          return b.name.localeCompare(a.name);
        });
      } else {
        filter1.sort(function (a, b) {
          return a.name.localeCompare(b.name);
        });
      }
    } else if (filterField == 'email') {
      if (filterKey == 'desc') {
        filter1.sort(function (a, b) {
          return b.email.localeCompare(a.email);
        });
      } else {
        filter1.sort(function (a, b) {
          return a.email.localeCompare(b.email);
        });
      }
    } else {
      filter1.sort(function (a, b) {
        return a.email.localeCompare(b.email);
      });
    }
    let start = 0;
    const empty = [];
    let reqsize = size;
    const totalpages = Math.ceil(filter1.length / size);
    let nextpage = true;
    let prevpage = false;
    if (page > 1 && page < totalpages) {
      nextpage = true;
      prevpage = true;
    } else if (page == 1 && page < totalpages) {
      nextpage = true;
      prevpage = false;
    } else if (page > 1 && page == totalpages) {
      nextpage = false;
      prevpage = true;
    } else {
      nextpage = false;
      prevpage = false;
    }
    if (size >= filter1.length) {
      reqsize = filter1.length;
      if (page != 1) {
        return {
          page_number: page,
          page_size: size,
          count: 0,
          total_pages: 1,
          has_previous_page: true,
          has_next_page: false,
          datas: empty,
        };
      }
    } else if (size < filter1.length && page != 1) {
      start = (page - 1) * size;
      reqsize = page * size;
      if (reqsize < filter1.length) {
      } else {
        reqsize = filter1.length;
      }
    }
    const results = [];
    for (let i = start; i < reqsize; i += 1) {
      const user = filter1[i];
      results.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    }
    const count = reqsize - start;
    if (size == 999) {
      return {
        page_number: page,
        page_size: reqsize,
        count: count,
        total_pages: totalpages,
        has_previous_page: prevpage,
        has_next_page: nextpage,
        data: results,
      };
    }
    return {
      page_number: page,
      page_size: size,
      count: count,
      total_pages: totalpages,
      has_previous_page: prevpage,
      has_next_page: nextpage,
      data: results,
    };
  } catch (error) {
    return next(error);
  }
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
};
