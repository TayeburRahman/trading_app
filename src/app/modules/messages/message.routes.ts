import express from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { messageController } from './message.controller';

import { validateRequest } from '../../middlewares/validateRequest';
import { MessageValidation } from './messages.validation';
import { uploadFile } from '../../middlewares/fileUploader';

const router = express.Router();

router.post(
  '/send-message', 
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.USER,ENUM_USER_ROLE.ADMIN), 
  uploadFile(),
  messageController.sendMessageOne,
);
router.get(
  '/get-conversation/:userId', 
  messageController.conversationUser,
);
router.get(
  '/get-message/:id',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.USER),
  messageController.getMessages,
);

export const MessageRoutes = router;
