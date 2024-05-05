const usersSchema = {
  name: String,
  email: String,
  password: String,
  attempt: Number,
  last_attempt: Date,
};

module.exports = usersSchema;
