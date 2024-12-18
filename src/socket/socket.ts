import { Server } from 'socket.io';
import { messageService } from '../app/modules/messages/message.service';

const socket = async (io: Server) => {
  io.on('connection', async (socket) => {
    const currentUserId : any = socket.handshake.query.id;
    socket.join(currentUserId); 
    console.log('👤 A user connected', currentUserId);
    
    await messageService.sendMessage(currentUserId, socket, io)

    // socket.on('join', userId => {
    //   socket.join(userId);
    //   console.log(`User ${userId} joined room`);
    // });

    //disconnect user
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

export default socket;
