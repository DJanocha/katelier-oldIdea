import { Model } from 'mongoose';

export const name = (model: Model<any>) => model.modelName.toLocaleLowerCase();
