import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
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
};

const UserSchema = new Schema<UserType>({
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
UserSchema.pre(
  /^save/,
  async function (
    this: UserType & { isModified: (x: keyof UserType) => boolean },
    next
  ) {
    if (!this.isModified('password')) {
      next();
    }
    if (this.passwordConfirm != undefined) {
      this.passwordConfirm = undefined;
    }
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
);

UserSchema.index({ email: 1 }, { unique: true });
export const User = model<UserType>('User', UserSchema);
