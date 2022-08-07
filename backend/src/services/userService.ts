import { User } from 'src/models';

export const countUsers = async() => User.find().count();
export const getUserByEmail = async({email}:{ email: string })=>User.findOne({email})
