import { NextFunction } from 'express';
import mongoose from 'mongoose';

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
};

const UserSchema = new Schema<UserType>({
  name: { type: String, requried: true },
  tel: { type: String, requried: false },
  email: { type: String, requried: false },
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
    minlength: 8
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
    }
  }
});
UserSchema.pre(/^save/, function (this: UserType, next) {
  if (this.passwordConfirm != undefined) {
    this.passwordConfirm = undefined;
  }
  next();
});

export const User = model<UserType>('User', UserSchema);
