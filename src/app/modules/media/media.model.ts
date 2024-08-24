import { model, Schema } from 'mongoose';
import { IAdds, IAddsVideo } from './media.interface';

const addsSchema = new Schema<IAdds>(
  {
    order: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
const videoAddsSchema = new Schema<IAddsVideo>(
  {
    order: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    video: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
export const Adds = model('Adds', addsSchema);
export const VideoAdds = model('VideoAdds', videoAddsSchema);
