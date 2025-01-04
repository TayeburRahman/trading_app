import mongoose, { model } from 'mongoose';

//! Privacy and policy
const privacySchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
//! About US
const aboutUsSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);
//! Terms Conditions
const termsAndConditionsSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

//! Privacy and policy
const faqSchema = new mongoose.Schema(
  {
    questions: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  },
);

export const Faq = model('Faq', faqSchema);
export const Facts = model('Facts', privacySchema);
export const AboutUs = model('AboutUs', aboutUsSchema);
export const TermsConditions = model(
  'TermsConditions',
  termsAndConditionsSchema,
);
