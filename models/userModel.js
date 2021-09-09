const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name,email,photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    unique: [true, 'username must be unique'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'A user must have a email'],
    unique: [true, 'email must be unique'],
    lowercase: true,
    validate: [validator.isEmail, 'Email must be valid'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'A user must be a password confirm'],
    validate: {
      message: 'PasswordConfirm must be equil password',
      validator: function (val) {
        return val === this.password;
      },
    },
  },
  passwordChangeAt: {
    type: Date,
    // required: true,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: { type: Boolean, default: true },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) next();
  this.passwordChangeAt = Date.now() - 1000; // т.к. бывает что пароль будет записан чуть раньше чем время поэтому -1 секунда
  next();
});

userSchema.pre(/^find/, function (next) {
  //start if query start with word find
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedTimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //+10min
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
