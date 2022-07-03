import { Schema, Types, model, Document } from 'mongoose';
import { ProjectModel } from './projects';
import { UserModel } from './users';

export interface ITransaction {
  client: Types.ObjectId;
  artist: Types.ObjectId;
  accepted: boolean;
  description: string;
  price: number;
  creation_date: Date;
  deadline: Date;
  project: Types.ObjectId;
}

export interface TransactionDocument extends ITransaction, Document {
  client: UserModel['_id'];
  artist: UserModel['_id'];
  project: ProjectModel['_id'];
}

export type TransactionModel = TransactionDocument;

const TransactionSchema = new Schema<TransactionDocument, TransactionModel>({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    requried: [true, 'Transaction needs to have a seller associated.']
  },
  artist: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    requried: [true, 'Transaction needs to have a buyer associated.']
  },
  accepted: {
    type: Boolean,
    default: false
  },
  description: String,
  price: Number,
  creation_date: {
    type: Date,
    default: Date.now
  },
  deadline: Date,
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Transaction needs to have a project associated.']
  }
});

export const Transaction = model<TransactionDocument, TransactionModel>('Transaction', TransactionSchema);
