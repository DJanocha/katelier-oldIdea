import bcrypt from 'bcryptjs';
import { Document, Model, Query, Types, Schema, model } from 'mongoose';
import { AppError } from 'src/utils';
import { generateResetToken } from 'src/utils/authUtils';
import isEmail from 'validator/lib/isEmail';
import { Category, CategoryModel, ICategory } from './categories';
//https://github.com/Automattic/mongoose/issues/9535#issuecomment-727039299
type Role = 'client' | 'artist';

export interface IBaseUser {
  name: string;
  tel: string;
  email: string;
  ig: string;
  facebook: string;
  image?: string;
}
export interface IUser extends IBaseUser {
  role: Role;
  categories?: Types.ObjectId[];
  password: string;
  passwordConfirm: string | undefined;
  passwordChangedAt: Date;
  resetPassword?: string;
  resetPasswordExpires?: number;
  active: boolean;
}
export interface UserDocument extends IUser, Document {
  categories: Types.Array<CategoryModel['_id']>;
  createResetPasswordToken(): Promise<string>;
  removeResetPasswordToken(): Promise<void>;
  addCategory(name: string): Promise<void>;
}
export interface UserDocumentWithCategories extends UserDocument {
  // if line below creates errors, try to make it an array of ICategory instead of categoryModel (not to extend Model, Document or whatever)
  categories: Types.Array<CategoryModel>;
}

/*Now it can be as a type. If you want to add some 
static functions, you better change
it to interface */
export type UserModel = UserDocument;
const UserSchema = new Schema<IUser, Model<IUser>>({
  name: { type: String, requried: true },
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
    type: [Schema.Types.ObjectId],
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
      validator: function (this: UserDocument) {
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
      validator: function (this: IUser) {
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
UserSchema.pre<UserDocument>(/^save/, async function (this: UserDocument, next) {
  if (!this.isModified('password')) {
    next();
  }
  if (this.passwordConfirm != undefined) {
    this.passwordConfirm = undefined;
  }
  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date();
  }
  next();
});
UserSchema.pre<Query<UserDocument, UserDocument>>(/^find/, async function (next) {
  this.find({ active: { $ne: false } });

  next();
});

UserSchema.methods.addCategory = async function (this: UserDocument, name: string) {
  const { categories } = await this.populate({ path: 'categories' });
  const categoryNameOccupied = categories.find((category: ICategory) => category.name === name);

  if (categoryNameOccupied) {
    throw new AppError('User already has a category with given name', 400);
  }
  const newCategory = new Category({ name });
  await newCategory.save();

  this.categories.push(newCategory._id);
  await this.save();
};
UserSchema.methods.createResetPasswordToken = async function (this: UserDocument) {
  const { expiresIn, hashed, token } = generateResetToken();
  this.resetPassword = hashed;
  this.resetPasswordExpires = expiresIn;
  await this.save();
  return token;
};
UserSchema.methods.removeResetPasswordToken = async function (this: UserDocument) {
  this.resetPassword = undefined;
  this.resetPasswordExpires = undefined;
  await this.save();
};

UserSchema.index({ email: 1 }, { unique: true });
export const User = model<IUser>('User', UserSchema);
