import { JwtPayload } from 'jsonwebtoken';
import { IProducts } from './products.interface';
import ApiError from '../../../errors/ApiError';
import { Product } from './products.model';
import { Category } from '../category/category.model';
import { SubCategory } from '../sub-category/sub-category.model';
import User from '../auth/auth.model';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Request } from 'express';
import Notification from '../notifications/notifications.model';
import { IUser } from '../auth/auth.interface';
import { makeProductPoints, makeSwapPoints } from '../points/points.services';
import { Ratting } from '../rattings/rattings.model';
import { Types } from 'mongoose';
import { sendPushNotification } from '../push-notification/push.notifications';

const insertIntoDB = async (
  files: any,
  payload: IProducts,
  user: JwtPayload,
) => {
  if (!files?.product_img) {
    throw new ApiError(400, 'File is missing');
  }
  const checkIsExistCategory = await Category.findById(payload.category);

  if (!checkIsExistCategory) {
    throw new ApiError(400, 'Category not found');
  }
  const checkIsExistSubCategory = await SubCategory.findById(
    payload.subCategory,
  );
  if (!checkIsExistSubCategory) {
    throw new ApiError(400, 'Sub Category not found');
  }
  const existUser = await User.findById(user.userId);
  if (!existUser) {
    throw new ApiError(400, 'User not found');
  }
  if (files?.product_img) {
    const images = files.product_img.map(
      (file: any) => `/images/products/${file.filename}`,
    );
    payload.images = images;
  }
  payload.user = user.userId;

  const result = await Product.create(payload);

  const notificationMessage = `You successfully post your add!`;
  const notification = await Notification.create({
    title: notificationMessage,
    user: user.userId,
    product: result?._id,
    message: 'View for more details.',
  });

  const dbReceiver = await User.findById(user.userId)
  if (dbReceiver?.deviceToken) {
    const payload = {
      title: notificationMessage,
      body: 'View for more details.'
    };

    sendPushNotification({ fcmToken: dbReceiver?.deviceToken, payload });
  }

  //@ts-ignore
  const socketIo = global.io;
  if (socketIo) {
    socketIo.emit(
      `notification::${notification?._id.toString()}`,
      notification,
    );
  }

  return result;
};

const products = async (query: Record<string, unknown>) => {
  const userId = query.userId;

  const categoryQuery = new QueryBuilder(Product.find(), query)
    .search(['title'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const myProducts = async (user: JwtPayload, query: Record<string, unknown>) => {
  const categoryQuery = new QueryBuilder(
    Product.find({ user: user.userId })
      .populate('category')
      .populate('subCategory'),
    query,
  )
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await categoryQuery.modelQuery;
  const meta = await categoryQuery.countTotal();

  return {
    meta,
    data: result,
  };
};

const updateProduct = async (req: Request) => {
  const { files } = req as any;
  const id = req.params.id;
  const productImage: string[] = [];

  console.log("Updated product:", files.product_img);

  if (files && files?.product_img && files?.product_img.length) {
    for (const image of files.product_img) {
      productImage.push(`/images/products/${image.filename}`);
    }
  }

  const isExist = await Product.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(404, 'Product not found!');
  }

  const updateData = {
    ...req.body,
    images: productImage?.length ? productImage : isExist?.images,
  };

  try {
    const result = await Product.findOneAndUpdate(
      { _id: id },
      { ...updateData },
      { new: true }
    );
    if (!result) {
      throw new ApiError(500, 'Update failed, no product returned!');
    }

    return result;
  } catch (error) {
    // console.error("Error updating product:", error);
    throw new ApiError(500, 'Internal server error');
  }
};

const deleteProduct = async (id: string) => {
  const isExist = await Product.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Product not found !');
  }
  return await Product.findByIdAndDelete(id);
};

const singleProduct = async (req: Request) => {
  // const {userId} = req.user as JwtPayload;
  const { id } = req.params;

  const result = await Product.findById(id).populate([
    {
      path: 'category',
      select: 'name',
    },
    {
      path: 'subCategory',
      select: 'name',
    },
    {
      path: "user",
    }
  ]);

  const user = await (User.findById(result?.user._id)) as IUser

  if (!user) {
    throw new ApiError(404, 'User not found!');
  }

  const similarProduct = await Product.find({
    subCategory: result?.subCategory,
  });
  const point = await makeProductPoints(result, user.userType)

  const rattingDB: any = await Ratting.aggregate([
    { $match: { swapOwner: new Types.ObjectId(result?.user._id) } },
    {
      $group: {
        _id: '$swapOwner',
        averageRating: { $avg: '$ratting' },
      },
    },
  ]);

  let average_rating = 0;
  if (rattingDB?.length > 0) {
    average_rating = Number(rattingDB[0].averageRating.toFixed(2));
  }
  return { product: result, similarProduct, point, ratting: average_rating };
};

const productForSwap = async (req: Request) => {
  const user = req.user as JwtPayload;
  const { productId } = req.params;

  return await Product.findOne({
    $and: [{ user: user.userId }, { _id: productId }],
  });
};

const topProducts = async (req: Request) => {
  const users = await User.find().sort({ points: -1 });

  const userIds = users.map(user => user._id);

  const products = await Product.find({ user: { $in: userIds } }).sort({
    productValue: -1,
  });

  return products;
};

const productJustForYou = async (req: Request) => {
  const { userId } = req.user as JwtPayload;

  const user = (await User.findById(userId)) as IUser;
  const role = user?.role;

  const users = await User.find({ role: role });

  const userIds = users.map(user => user._id);

  const products = await Product.find({ user: { $in: userIds } }).sort({
    productValue: -1,
  });

  return products;
};

// const swapPointCount = async (req: Request) => {
//   const { userId } = req.user as JwtPayload;
//   const {fromProduct, toProduct}= req.query;
//   if(!fromProduct || !toProduct){
//     throw new ApiError(400, 'Missing product id');   
//   } 
//   const user = (await User.findById(userId)) as IUser;
//   const points = await makeSwapPoints({fromProduct, toProduct}, user.userType); 
//   return points;  
// }

export const ProductService = {
  insertIntoDB,
  products,
  myProducts,
  updateProduct,
  deleteProduct,
  singleProduct,
  productForSwap,
  topProducts,
  productJustForYou,
  // swapPointCount
};
