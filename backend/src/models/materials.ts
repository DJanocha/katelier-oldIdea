import mongoose, { Document, Types } from 'mongoose';

const { Schema, model } = mongoose;

export interface IMaterial {
  name: string;
  description: string;
  tags: string[];
  img: string;
}

export interface MaterialDocument extends IMaterial, Document {
  tags: Types.Array<string>;
}
/*
 Now it can be as a type. If you 
 want to add some static functions, 
 you better change
it to interface like below:
export interface MaterialModel extends MaterialDocument{
  //those functions are like example ones to
  getAllBelowPercentage(percentage: number): Promise<Types.Array<MaterialDocument>>
  getAllEmpty():Promise<Types.Array<MaterialDocument>>
}

*/
export type MaterialModel = MaterialDocument;

const MaterialSchema = new Schema<MaterialDocument, MaterialModel>({
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

export const Material = model<MaterialDocument, MaterialModel>('Material', MaterialSchema);
