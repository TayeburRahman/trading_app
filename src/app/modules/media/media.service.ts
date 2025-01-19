/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import QueryBuilder from '../../../builder/QueryBuilder';
import ApiError from '../../../errors/ApiError';
import { IAdds, IAddsVideo, IFilesVideo } from './media.interface';
import { Adds, SmallBanner, VideoAdds } from './media.model';
import mongoose from 'mongoose';

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
  // if (!files?.video) {
  //   throw new ApiError(400, 'File is missing');
  // }

  // if (files?.video) {
  //   payload.video = `/video/${files.video[0].filename}`;
  // }
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
  // console.log("image", AddsData)
  const result = await Adds.findOneAndUpdate(
    { _id: id },
    { ...AddsData },
    {
      new: true,
    },
  );
  // console.log("result", result)
  return result;
};
const updateVideoAdds = async (req: Request) => {
  // const { files } = req as any;
  const id = req.params.id;
  const { ...AddsData } = req.body;

  // Validate the ID
  if (!id) {
    throw new ApiError(400, 'Missing VideoAdds ID.');
  }

  if (!AddsData || Object.keys(AddsData).length === 0) {
    throw new ApiError(400, 'Missing or invalid VideoAdds data.');
  }

  try {
    console.log('Update VideoAdds Request:', AddsData);

    // if (files && files.video && files.video[0]) {
    //   AddsData.video = `/video/${files.video[0].filename}`;
    // }

    const isExist = await VideoAdds.findById(id);
    if (!isExist) {
      throw new ApiError(404, 'VideoAdds not found.');
    }

    const updatedData: Partial<IAddsVideo> = { ...AddsData };
    const result = await VideoAdds.findOneAndUpdate(
      { _id: id },
      { ...updatedData },
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new ApiError(500, 'Failed to update VideoAdds.');
    }

    return result;
  } catch (error: any) {
    console.error('Error updating VideoAdds:', error);
    throw new ApiError(
      500,
      `An error occurred while updating VideoAdds: ${error.message}`,
    );
  }
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
const addSmallBanner = async (req: any) => {
  const files = req.files;
  const payload = req.body;

  if (!files?.files) {
    throw new ApiError(400, 'File is missing');
  }

  if (files?.files) {
    payload.files = `/images/banner/${files.files[0].filename}`;
  }

  return await SmallBanner.create(payload);
};

const updateSmallBanner = async (req: Request) => {
  const { files } = req as any;
  const id = req.params.id;
  const { ...AddsData } = req.body;

  // Validate the ID
  if (!id) {
    throw new ApiError(400, 'Missing VideoAdds ID.');
  }

  if (!AddsData || Object.keys(AddsData).length === 0) {
    throw new ApiError(400, 'Missing or invalid VideoAdds data.');
  }

  try {
    if (files && files.files && files.files[0]) {
      AddsData.files = `/images/banner/${files.files[0].filename}`;
    }

    const isExist = await SmallBanner.findById(id);
    if (!isExist) {
      throw new ApiError(404, 'VideoAdds not found.');
    }

    const updatedData: Partial<IFilesVideo> = { ...AddsData };
    console.log('updates:', updatedData);
    const result = await SmallBanner.findOneAndUpdate(
      { _id: id },
      { ...updatedData },
      { new: true, runValidators: true },
    );

    if (!result) {
      throw new ApiError(500, 'Failed to update VideoAdds.');
    }

    return result;
  } catch (error: any) {
    console.error('Error updating VideoAdds:', error);
    throw new ApiError(
      500,
      `An error occurred while updating VideoAdds: ${error.message}`,
    );
  }
};

const getSmallBanner = async (query: Record<string, unknown>) => {
  const addsQuery = new QueryBuilder(SmallBanner.find(), query)
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

const deleteSmallBanner = async (id: string) => {
  const isExist = await SmallBanner.findOne({ _id: id });

  if (!isExist) {
    throw new ApiError(404, 'Banner not found !');
  }
  return await SmallBanner.findByIdAndDelete(id);
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
  addSmallBanner,
  getSmallBanner,
  deleteSmallBanner,
  updateSmallBanner,
};
