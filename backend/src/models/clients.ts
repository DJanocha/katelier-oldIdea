import mongoose from 'mongoose';

const { Schema, model } = mongoose;

type ClientType = {
  name: string;
  tel: string;
  email: string;
  ig: string;
  facebook: string;
  image?: string;
  projects?: mongoose.Types.ObjectId[];
};

const ClientSchema = new Schema<ClientType>({
  name: { type: String, requried: true },
  tel: { type: String, requried: false },
  email: { type: String, requried: false },
  ig: { type: String, requried: false },
  facebook: { type: String, requried: false },
  projects: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
    required: false
  },
  image: {
    type: String,
    required: false
  }
});

const Client = model<ClientType>('Client', ClientSchema);
export default Client;
