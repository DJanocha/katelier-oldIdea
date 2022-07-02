import { Schema, Types, model } from 'mongoose';

type TransactionType = {
  client: Types.ObjectId;
  artist: Types.ObjectId;
  accepted: boolean;
  description: string;
  price: number;
  creation_date: Date;
  deadline: Date;
  project: Types.ObjectId;
};

const TransactionSchema = new Schema<TransactionType>({
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

export const Transaction = model<TransactionType>(
  'Transaction',
  TransactionSchema
);
