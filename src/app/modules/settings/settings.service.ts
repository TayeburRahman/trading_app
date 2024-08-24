import { AboutUs, Facts, TermsConditions } from './settings.model';

//! Facts
const addFacts = async (payload: any) => {
  const checkIsExist = await Facts.findOne();
  if (checkIsExist) {
    return await Facts.findOneAndUpdate({}, payload, {
      new: true,

      runValidators: true,
    });
  } else {
    return await Facts.create(payload);
  }
};
const getFacts = async () => {
  return await Facts.findOne();
};

//! About us
const addAboutUs = async (payload: any) => {
  const checkIsExist = await AboutUs.findOne();
  if (checkIsExist) {
    return await AboutUs.findOneAndUpdate({}, payload, {
      new: true,

      runValidators: true,
    });
  } else {
    return await AboutUs.create(payload);
  }
};
const getAboutUs = async () => {
  return await AboutUs.findOne();
};
//! Terms Conditions
const addTermsConditions = async (payload: any) => {
  const checkIsExist = await TermsConditions.findOne();
  if (checkIsExist) {
    return await TermsConditions.findOneAndUpdate({}, payload, {
      new: true,

      runValidators: true,
    });
  } else {
    return await TermsConditions.create(payload);
  }
};
const getTermsConditions = async () => {
  return await TermsConditions.findOne();
};

export const ManageService = {
  addFacts,
  addAboutUs,
  addTermsConditions,
  getFacts,
  getAboutUs,
  getTermsConditions,
};
