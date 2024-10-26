import httpStatus from 'http-status';
import { ISubscriptions } from '../subscriptions/subscriptions.interface';
import { Subscription } from '../subscriptions/subscriptions.model';
import ApiError from '../../../errors/ApiError';

const makePoints = async (ratting: number, isPackagtes: ISubscriptions) => {
  let point = 0;

  if (ratting >= 3) {
    if (isPackagtes.planName === 'Gold' || 'Trial') {
      point = Number(isPackagtes.positiveCommentPoint);
    } else if (isPackagtes.planName === 'Platinum') {
      point = Number(isPackagtes.positiveCommentPoint);
    } else if (isPackagtes.planName === 'Diamond') {
      point = Number(isPackagtes.positiveCommentPoint);
    }
  }

  if (ratting < 3) {
    if (isPackagtes.planName === 'Gold' || 'Trial') {
      point = Number(isPackagtes.negativeCommentPoint);
    } else if (isPackagtes.planName === 'Platinum') {
      point = Number(isPackagtes.negativeCommentPoint);
    } else if (isPackagtes.planName === 'Diamond') {
      point = Number(isPackagtes.negativeCommentPoint);
    }
  }

  return point;
};

const makeSwapPoints = async (product: any, userBoth: any) => {
  const {user, toUser} = userBoth;

  const isFromUserPackage = await Subscription.findOne({planName: user.userType });
  const isToUserPackage = await Subscription.findOne({planName: toUser.userType });

  console.log("======isFromUserPackage====", isFromUserPackage)
  console.log("======isToUserPackage====", isToUserPackage)

  if (!isFromUserPackage) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'Your subscription plan not found',
    );
  }

  if (!isToUserPackage) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'To user subscription plan not found',
    );
  }

  const fromUserPoints =
    (Number(product.toProduct.productValue) * Number(isToUserPackage.swapPoint)) /
    100;
  const toUserPoints =
    (Number(product.fromProduct.productValue) * Number( isFromUserPackage.swapPoint)) /
    100;
  const earnPointFromUser = Math.floor(fromUserPoints);
  const earnPointToUser = Math.floor(toUserPoints);

  console.log("======toUserPoints====", toUserPoints)
  console.log("======fromUserPoints====", fromUserPoints)

  return { earnPointFromUser, earnPointToUser };
};

const makeProductPoints = async (product: any, planName: string) => {
 

  const isUserPackage = await Subscription.findOne({ planName });
  if (!isUserPackage) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      'User subscription plan not found',
    );
  }

  const userPoints =
    (Number(product.productValue) * Number(isUserPackage.swapPoint)) /
    100; 
   
  const earnPointUser = Math.floor(userPoints); 


  return earnPointUser ;
};

export { makePoints, makeSwapPoints, makeProductPoints };
