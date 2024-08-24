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
      required: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    address: {
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
      enum: ['Gold', 'Platinum', 'Diamond', 'Trial'],
      default: 'Trial',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Others'],
    },

    profile_image: {
      type: String,
      default:
        'https://png.pngtree.com/png-clipart/20230513/ourmid/pngtree-smile-dog-on-white-background-png-image_7096061.png',
    },
    cover_image: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1504805572947-34fad45aed93?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y292ZXIlMjBwaG90b3xlbnwwfHwwfHx8MA%3D%3D',
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
