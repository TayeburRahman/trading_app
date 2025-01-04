import { model, Schema } from 'mongoose';

const rattingSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    swap: {
      type: Schema.Types.ObjectId,
      ref: 'Swap',
      required: true,
    },
    swapOwner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
    },
    ratting: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Ratting = model('Ratting', rattingSchema);
