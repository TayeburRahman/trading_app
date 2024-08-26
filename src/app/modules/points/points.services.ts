import httpStatus from "http-status";
import { ISubscriptions } from "../subscriptions/subscriptions.interface";
import { Subscription } from "../subscriptions/subscriptions.model";
import ApiError from "../../../errors/ApiError";

const makePoints = async (ratting: number, isPackagtes: ISubscriptions) => {

    let point = 0

    if (ratting >= 3) {
        if (isPackagtes.planName === "Gold" || "Trial") {
            point =Number(isPackagtes.positiveCommentPoint)

        } else if (isPackagtes.planName === "Platinum") {
            point = Number(isPackagtes.positiveCommentPoint)
        }
        else if (isPackagtes.planName === "Diamond") {
            point = Number(isPackagtes.positiveCommentPoint)
        }
    }

    if (ratting < 3) {
        if (isPackagtes.planName === "Gold" || "Trial") {
            point = Number(isPackagtes.negativeCommentPoint)

        } else if (isPackagtes.planName === "Platinum") {
            point = Number(isPackagtes.negativeCommentPoint)
        }
        else if (isPackagtes.planName === "Diamond") {
            point = Number(isPackagtes.negativeCommentPoint)
        }

    }

    return point
};


const makeSwapPoints = async (product: any, planName: string) => {

 
    const isPackagtes = await Subscription.findOne({ planName });
    if (!isPackagtes) {
      throw new ApiError(httpStatus.NOT_FOUND, 'User subscription plan not found');
    } 
    
    const fromUserPoints = (Number(product.fromProduct.productValue) * Number(isPackagtes.swapPoint)) / 100;
    const toUserPoints = (Number(product.toProduct.productValue) * Number(isPackagtes.swapPoint)) / 100;
    const earnPointFromUser = Math.floor(fromUserPoints);
    const earnPointToUser = Math.floor(toUserPoints);
 
    return { earnPointFromUser, earnPointToUser}
 
};
 
export {
    makePoints,
    makeSwapPoints
};