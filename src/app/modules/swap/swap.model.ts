import { model, Schema } from 'mongoose';
import { ISwap } from './swap.interface';

const swapSchema = new Schema<ISwap>(
  {
    userFrom: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productTo: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    }, 
    isApproved: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    }, 
    swapUserToPoint: {  
      type: Number,
    },
    swapUserFromPoint: {  
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);
export const Swap = model('Swap', swapSchema);



// const getApprovedSwapsByProductName = async (req: Request) => {
//   const user = req.user as IReqUser;
//   const productName = req.query.productName as string; // Assuming product name is passed as a query parameter

//   console.log(user);

//   // Fetch swaps where either userFrom or userTo matches userId and isApproved is 'approved'
//   const swaps = await Swap.find({
//     $and: [
//       {
//         $or: [
//           { userFrom: user.userId },
//           { userTo: user.userId }
//         ]
//       },
//       { isApproved: 'approved' }
//     ]
//   })
//   .populate({
//     path: 'productFrom',
//     match: { title: new RegExp(productName, 'i') }, // Case-insensitive search for product name
//   })
//   .populate({
//     path: 'productTo',
//     match: { title: new RegExp(productName, 'i') }, // Case-insensitive search for product name
//   });

//   // Filter out swaps where neither productFrom nor productTo matched the productName
//   const filteredSwaps = swaps.filter(swap => 
//     (swap.productFrom && swap.productFrom.title) || 
//     (swap.productTo && swap.productTo.title)
//   );

//   return filteredSwaps;
// };