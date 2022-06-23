import mongoose from 'mongoose';

const { Schema, model } = mongoose;

export type MaterialType = {
  name: string;
  description: string;
  tags: string[];
  img: string;
};

const MaterialSchema = new Schema<MaterialType>({
  name: {
    type: String,
    required: [true, 'name required']
  },
  description: {
    type: String,
    default: ''
  },
  tags: [String],
  img: String
});

export const Material = model<MaterialType>('Material', MaterialSchema);
