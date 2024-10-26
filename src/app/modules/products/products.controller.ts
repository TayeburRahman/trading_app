import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchasync';
import { ProductService } from './products.service';
import sendResponse from '../../../shared/sendResponse';
import { IProducts } from './products.interface';
import { JwtPayload } from 'jsonwebtoken';

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.insertIntoDB(
    req.files,
    req.body,
    req.user as JwtPayload,
  );
  sendResponse<IProducts>(res, {
    statusCode: 200,
    success: true,
    message: 'Product create successfully',
    data: result,
  });
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.updateProduct(req);
  sendResponse<IProducts>(res, {
    statusCode: 200,
    success: true,
    message: 'Product update successfully',
    data: result,
  });
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.deleteProduct(req.params.id);
  sendResponse<IProducts>(res, {
    statusCode: 200,
    success: true,
    message: 'Product delete successfully',
    data: result,
  });
});

const products = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.products(req.query);
  sendResponse<IProducts[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Product Retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const myProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.myProducts(
    req.user as JwtPayload,
    req.query,
  );
  sendResponse<IProducts[]>(res, {
    statusCode: 200,
    success: true,
    message: 'Product Retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const productForSwap = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.productForSwap(req);
  sendResponse<IProducts>(res, {
    statusCode: 200,
    success: true,
    message: 'Product get successfully',
    data: result,
  });
});

const singleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.singleProduct(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product get successfully',
    data: result,
  });
});

const topProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.topProducts(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product get successfully',
    data: result,
  });
});

const productJustForYou = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.productJustForYou(req);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Product get successfully',
    data: result,
  });
});

// const swapPointCount = catchAsync(async (req: Request, res: Response) => {
//   const result = await ProductService.swapPointCount(req);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Product point get successfully',
//     data: result,
//   });
// });

 

export const ProductController = {
  insertIntoDB,
  products,
  myProducts,
  updateProduct,
  deleteProduct,
  productForSwap,
  singleProduct,
  topProducts,
  productJustForYou,
  // swapPointCount
};
