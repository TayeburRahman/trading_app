/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import QueryBuilder from '../../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { IAdds, IAddsVideo } from './media.interface';
import { Adds, VideoAdds } from './media.model';

const insertIntoDB = async (files: any, payload: IAdds) => {
  if (!files?.image) {
    throw new ApiError(400, 'File is missing');
  }

  if (files?.image) {
    payload.image = `/images/image/${files.image[0].filename}`;
  }
  return await Adds.create(payload);
};
const addVideoAdds = async (files: any, payload: IAddsVideo) => {
  if (!files?.video) {
    throw new ApiError(400, 'File is missing');
  }

  if (files?.video) {
    payload.video = `/video/${files.video[0].filename}`;
  }
  return await VideoAdds.create(payload);
};
const allAdds = async (query: Record<string, unknown>) => {
  const addsQuery = new QueryBuilder(Adds.find(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await addsQuery.modelQuery;
  const meta = await addsQuery.countTotal();

  return {
    meta,
    data: result,
  };
};
const allVideoAdds = async (query: Record<string, unknown>) => {
  const addsQuery = new QueryBuilder(VideoAdds.find(), query)
    .search([])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await addsQuery.modelQuery;
  const meta = await addsQuery.countTotal();

  return {
    meta,
    data: result,
  };
};
const updateAdds = async (req: Request) => {
  const { files } = req as any;
  const id = req.params.id;
  const { ...AddsData } = req.body;

  if (files && files.image) {
    AddsData.image = `/images/image/${files.image[0].filename}`;
  }

  const isExist = await Adds.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Adds not found !');
  }

  const updatedData: Partial<IAdds> = { ...AddsData };

  const result = await Adds.findOneAndUpdate(
    { _id: id },
    { ...updatedData },
    {
      new: true,
    },
  );
  return result;
};
const updateVideoAdds = async (req: Request) => {
  const { files } = req as any;
  const id = req.params.id;
  const { ...AddsData } = req.body;

  if (files && files.video) {
    AddsData.video = `/video/${files.video[0].filename}`;
  }

  const isExist = await VideoAdds.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'VideoAdds not found !');
  }

  const updatedData: Partial<IAddsVideo> = { ...AddsData };

  const result = await VideoAdds.findOneAndUpdate(
    { _id: id },
    { ...updatedData },
    {
      new: true,
    },
  );
  return result;
};
const deleteAdds = async (id: string) => {
  const isExist = await Adds.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Adds not found !');
  }
  return await Adds.findByIdAndDelete(id);
};
const deleteVideoAdds = async (id: string) => {
  const isExist = await VideoAdds.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'VideoAdds not found !');
  }
  return await VideoAdds.findByIdAndDelete(id);
};
export const AddsService = {
  insertIntoDB,
  allAdds,
  updateAdds,
  deleteAdds,
  addVideoAdds,
  allVideoAdds,
  updateVideoAdds,
  deleteVideoAdds,
};
