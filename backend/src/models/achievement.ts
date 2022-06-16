import mongoose from 'mongoose';

const { Schema, model } = mongoose;

type AchievementType = {
  category: string;
  project: string;
  stage: number;
  image?: string;
  activity_id?: mongoose.Types.ObjectId;
  // user_id?: mongoose.Types.ObjectId;
  // user_id has be required, but I think we have to keep it that way for now. When we define users, we'll be able
  // to create achievements based on that
};

const achievementSchema = new Schema<AchievementType>({
  category: {
    type: String,
    requried: [true, 'category required']
  },
  project: {
    type: String,
    requried: [true, 'category required']
  },
  stage: {
    type: Number,
    requried: [true, 'category required']
  },
  image: {
    type: String,
    required: false
  }
});

achievementSchema.method('getPath', function () {
  return `img/${this.category}/../${this.project}/../${this.stage_count}.png`;
});
const Achievement = model<AchievementType>('Achievement', achievementSchema);
export default Achievement;
