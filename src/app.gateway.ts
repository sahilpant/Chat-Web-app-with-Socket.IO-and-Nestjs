import { SubscribeMessage, WebSocketGateway, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({namespace:'/chat'})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;
  
   private logger: Logger = new Logger('AppGateway');

   private users:any = {};
   private userid:any = [];
   private ctr = 0;

  handleDisconnect(client:Socket):void {
    this.logger.log(`user ${this.users[client.id]} left the channel`);
    client.broadcast.emit(`user ${this.users[client.id]} left the channel`);
    delete this.users[client.id];
  }
  
  handleConnection(client: Socket, ...args:any[]):void {
    this.users[client.id] = ++this.ctr;
    this.userid.push(client.id)
    this.logger.log(`user connected ${client.id}`);
    client.broadcast.emit(`user ${this.users[client.id]} joined the channel`);
    this.wss.to(this.userid[this.ctr-1]).emit(`Welcome To the server user ${this.ctr}`);
  }
  
  afterInit(server: Server):void {
    this.logger.log('initiated');
  }

  @SubscribeMessage('chat')
  async handleMessage(client: Socket, data:{message: string , room: string}): Promise<void> {
    this.wss.emit('chat',`message from user ${this.users[client.id]} ==>> ${data}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string):void{
    client.join(room);
    client.broadcast.to(room).emit(`${this.users[client.id]} joined ${room}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string):void{
    client.leave(room);
    client.broadcast.to(room).emit(`${this.users[client.id]} left ${room}`);
  }
  
  @SubscribeMessage('welcome')
  handlewelcome(client:Socket):void {
    console.log(client.id);
    client.emit('welcome','welcome to the server');
  }
  
}
