/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request, Response } from 'express';
import Conversation from './conversation.model';
import Message from './message.model';
import ApiError from '../../../errors/ApiError';
import User from '../auth/auth.model'; 
import { Server, Socket } from 'socket.io';
import { sendPushNotification } from '../push-notification/push.notifications';

//* One to one conversation
// const sendMessage = async (req: Request) => {
//   const { id: receiverId } = req.params;
//   const senderId = req.user?.userId;
//   const data = req.body;

//   const { message } = data;

//   if (receiverId === null || senderId === null) {
//     throw new ApiError(404, 'Sender or Receiver user not found');
//   }

//   let conversation = await Conversation.findOne({
//     participants: { $all: [senderId, receiverId] },
//   });

//   if (!conversation) {
//     conversation = await Conversation.create({
//       participants: [senderId, receiverId],
//     });

//     const newMessage = new Message({
//       senderId,
//       receiverId,
//       message,
//       conversationId: conversation._id,
//     });

//     if (newMessage) {
//       conversation.messages.push(newMessage._id);
//     }
//     await Promise.all([conversation.save(), newMessage.save()]);
//     //@ts-ignore
//     const socketIO = global.io;
//     if (socketIO && conversation && newMessage) {
//       //@ts-ignore
//       // socketIO.to(receiverId).emit('getMessage', newMessage);
//       socketIO.emit(`message::${conversation._id.toString()}`, newMessage);
//     }

//     return newMessage;
//   }
// };

interface NewMessageData {
  receiverId: string;
  text: string;
  userType?: string;
  files?: {
    message_img?: '';
  };
}

const sendMessage = async (senderId: any, socket: Socket, io: Server): Promise<void> => {
  socket.on('new-message', async (data: NewMessageData) => {
    try { 
      const { receiverId, message, userType, files } = data as any;
 
      if (!receiverId || !senderId) {
        throw new ApiError(404, 'Sender or Receiver user not found');
      }
 
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
 
      let message_img = '';
      if (files?.message_img && files.message_img.length > 0) {
        message_img = `/images/message/${files.message_img[0].name}`;
      }
 
      const newMessage = new Message({
        senderId,
        receiverId,
        message,
        message_img,
        conversationId: conversation._id,
      });  
 
      conversation.messages.push(newMessage._id);
 
      await Promise.all([conversation.save(), newMessage.save()]);
 
       //@ts-ignore
      const socketIo = global.io;
      if (socketIo && conversation && newMessage) {
        socketIo.to(receiverId.toString()).emit('new-message', newMessage);
        socketIo.to(senderId.toString()).emit('new-message', newMessage);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: error.message || 'Unknown error' });
    }
  });
};

const sendMessageOne = async (req: any)=> {
  try {
    const { userId: senderId } = req.user;
    const files = req.files;
    const { receiverId, message } = req.body as any;

    console.log("========", receiverId, message)

    if (!receiverId || !senderId) {
      throw new ApiError(404, 'Sender or Receiver user not found');
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    let message_img = '';
    if (files?.message_img?.length > 0) {
      message_img = `/images/message/${files.message_img[0].filename}`;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      message_img,
      conversationId: conversation._id,
    });

    conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    const dbReceiver = await User.findById(receiverId);

    if (dbReceiver?.deviceToken) {
      const payload = {
        title: `${dbReceiver.name} sent a new message.`,
        body: `${message}`,
      };
      sendPushNotification({ fcmToken: dbReceiver?.deviceToken, payload });
    }
     
    //@ts-ignore
    const socketIo = global.io;
    if (socketIo) {
      socketIo.to(receiverId.toString()).emit('new-message', newMessage);
      socketIo.to(senderId.toString()).emit('new-message', newMessage);
    }

    console.log('======', newMessage)

     return { message: 'Message sent successfully' };

  } catch (error: any) {
    console.error('Error sending message:', error?.message || error);
  }
};


const getMessages = async (req: Request, res: Response) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req?.user?.userId;
    const { page = 1, limit = 20 } = req.query;   
 
    const skip = (Number(page) - 1) * Number(limit);
    const limitMessages = Number(limit);
 
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: 'messages',
      options: {
        skip,
        limit: limitMessages,
        sort: { createdAt: 1 },  
      },
    });

    if (!conversation) {
      return res.status(200).json({ messages: [], total: 0 });
    }

    const messages = conversation.messages;
    const totalMessages = await Message.countDocuments({
      conversationId: conversation._id,
    });

    const totalPages = Math.ceil(totalMessages / limitMessages);

    const userDetails = await User.findById(receiverId)

    return res.status(200).json({
      userDetails,
      messages, 
      totalMessages,
      totalPages,
      currentPage: Number(page),
      pageSize: Number(limit),
    });
  } catch (error: any) { 
    console.log('Error in getMessages controller: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const conversationUser = async (req: any) => {
  const { userId } = req.params;
 
  const conversations = await Conversation.find({
    participants: { $in: userId },
  }).populate("messages");
 
  const participantIds = [
    ...new Set(
      conversations.flatMap((convo) => convo.participants).filter((id) => id.toString() !== userId)
    ),
  ];
 
  const users = await User.find({
    _id: { $in: participantIds },
  }).select("_id name email role profile_image");
 
  const userMap = users.reduce((acc, user) => {
    //@ts-ignore
    acc[user._id] = { ...user._doc, type: "User" };
    return acc;
  }, {});

  const participantMap = { ...userMap };
 
  const conversationsWithParticipants = conversations.map((convo) => ({
    //@ts-ignore
    ...convo._doc,
    participants: convo.participants
      .filter((participantId) => participantId.toString() !== userId)
      //@ts-ignore
      .map((participantId) => participantMap[participantId]),
  }));

  return conversationsWithParticipants;
};


export const messageService = {
  sendMessage,
  getMessages,
  conversationUser,
  sendMessageOne
};
