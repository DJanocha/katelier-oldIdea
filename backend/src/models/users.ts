import bcrypt from 'bcryptjs';
import mongoose, { FilterQuery, Model, Query, QuerySelector } from 'mongoose';
import { generateResetToken } from 'src/utils/authUtils';
import isEmail from 'validator/lib/isEmail';
const { Schema, model } = mongoose;

export type UserType = {
  name: string;
  tel: string;
  email: string;
  ig: string;
  facebook: string;
  image?: string;
  role: 'client' | 'artist';
  categories?: mongoose.Types.ObjectId[];
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  resetPassword: string;
  resetPasswordExpires: number;
  active: boolean;
};

const UserSchema = new Schema<UserType, Model<UserType>>({
  name: { type: String, requried: true, unique: true },
  tel: { type: String, requried: false },
  email: {
    type: String,
    requried: true,
    unique: true,
    validate: [isEmail, 'Please provide correct email address']
  },
  ig: { type: String, requried: false },
  facebook: { type: String, requried: false },
  categories: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Category',
    default: []
  },
  image: {
    type: String,
    required: false
  },
  role: {
    type: String,
    default: 'client'
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    // minlength: 8,
    validate: {
      message: 'Password has to be at least 8 characters long.',
      validator: function (this: UserType) {
        return this.password.length >= 8;
      }
    },
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirmation is required'],
    minlength: 8,
    validate: {
      message: 'Passwords need to be identical.',
      // eslint-disable-next-line no-unused-vars
      validator: function (this: UserType) {
        return this.password === this.passwordConfirm;
      }
    },
    select: false
  },
  passwordChangedAt: { type: Date },
  resetPassword: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});
UserSchema.pre(/^save/, async function (this: UserType & { isModified: (x: keyof UserType) => boolean }, next) {
  if (!this.isModified('password')) {
    next();
  }
  if (this.passwordConfirm != undefined) {
    this.passwordConfirm = undefined;
  }
  this.password = await bcrypt.hash(this.password, 12);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  if (!this.isNew) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    this.passwordChangedAt = Date.now();
  }
  next();
});
UserSchema.pre(/^find/, async function (next) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  this.find({ active: { $ne: false } });

  next();
});

UserSchema.methods.createResetPasswordToken = function (this: UserType) {
  const { expiresIn, hashed, token } = generateResetToken();
  this.resetPassword = hashed;
  this.resetPasswordExpires = expiresIn;

  return token;
};

UserSchema.index({ email: 1 }, { unique: true });
export const User = model<UserType>('User', UserSchema);
