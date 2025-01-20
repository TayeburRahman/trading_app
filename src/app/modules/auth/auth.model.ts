import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../../config';
import validator from 'validator';
import { IUser, UserModel } from './auth.interface';

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: 'Please provide a valid email address',
      },
    },
    phone_number: {
      type: String,
      // required: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    deviceToken: {
      type: String,
      default: null,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    zip: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    points: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'SUPER_ADMIN', 'USER'],
      default: 'USER',
    },
    userType: {
      type: String,
      enum: ['Gold', 'Platinum', 'Diamond', 'Trial', "Expert"],
      default: 'Trial',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Others'],
    },
    profile_image: {
      type: String,
      default: 'https://i.ibb.co.com/sF7KDj5/profile.jpg',
    },
    cover_image: {
      type: String,
      default: 'https://i.ibb.co.com/mCxGBqX/backround.jpg',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },

    date_of_birth: {
      type: Date,
    },
    place_of_birth: {
      type: String,
    },
    license_number: {
      type: String,
    },
    passport_number: {
      type: String,
    },
    profession: {
      type: String,
    },
    region: {
      type: String,
    },
    haveChildren: {
      type: String,
    },
    havePets: {
      type: String,
    },
    haveVehicle: {
      type: String,
    },
    willingVehicle: {
      type: String,
    },
    ownerOfProperty: {
      type: String,
    },
    ableApproveForm: {
      type: String,
    },
    propertyInsured: {
      type: String,
    },
    utilitiesUptoDate: {
      type: String,
    },
    aboutSwap: {
      type: String,
    },
    departureArrival: {
      type: String,
    },
    travelStartDestination: {
      type: String,
    },
    travelEndDestination: {
      type: String,
    },
    travelStartState: {
      type: String,
    },
    travelEndState: {
      type: String,
    },
    travelStartCounty: {
      type: String,
    },
    travelEndCounty: {
      type: String,
    },
    travelStartCountry: {
      type: String,
    },
    travelEndCountry: {
      type: String,
    },
    purposeOfTravel: {
      type: String,
    },
    datesOfTravel: {
      type: Date,
    },
    verifyCode: {
      type: String,
    },
    activationCode: {
      type: String,
    },
    verifyExpire: {
      type: Date,
    },
    is_block: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    planExpatDate: {
      type: Date,
    },
    expirationTime: { type: Date, default: () => Date.now() + 2 * 60 * 1000 },
  },
  {
    timestamps: true,
  },
);

UserSchema.statics.isUserExist = async function (
  email: string,
): Promise<Pick<IUser, '_id' | 'password' | 'phone_number' | 'role'> | null> {
  return await User.findOne(
    { email },
    {
      _id: 1,
      email: 1,
      password: 1,
      role: 1,
      phone_number: 1,
    },
  );
};

UserSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

const User = model<IUser, UserModel>('User', UserSchema);

export default User;
