import {
  OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer, WsResponse,
} from '@nestjs/websockets';
import {Server} from 'ws';
import {Logger} from "@nestjs/common";
import {ThingsService} from "../things/things.service";

@WebSocketGateway({ transports: ['websocket'] })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

  @WebSocketServer() server: Server;
  private logger = new Logger(EventGateway.name);
  protected thingClients = [];

  constructor (private readonly thingService: ThingsService) {}

  afterInit(server: any): any {
    this.server.emit('testing', { event: "", do: 'stuff' });
  }

  handleConnection(client: any, ...args: any[]) {
    this.logger.log('new connection:' + client)
    const url = args[0].url;
    this.thingClients.push({client: client, event: url});

    this.logger.log('USERS CONNECTED: '+ this.thingClients.length + ' event subscription: '+ url );

  }

  handleDisconnect(client: any): any {
    for (let i = 0; i < this.thingClients.length; i++) {
      if (this.thingClients[i].client === client) {
        this.thingClients.splice(i, 1);
        break;
      }
    }
    this.logger.log('USERS CONNECTED: '+ this.thingClients.length);
    //this.broadcast('disconnect',{});
  }

  private broadcast(event, message: any) {
    this.logger.log('Broadcasting: '+ event);
    for (const c of this.thingClients) {
      c.event === this.slideUrlEvent(event) ? c.client.send(message): null;
    }
  }

  private slideUrlEvent (event){
    return event.split(process.env.ROOT_URL)[1];
  }


  @SubscribeMessage('wow-data')
  onThingData(client: any, payload: any): WsResponse<void> {
    this.logger.log('Wow-Data: '+ payload.id);
    this.thingService.putProperty(payload.id, payload.measurement);
    this.broadcast(payload.id, JSON.stringify({
      event:payload.id,
      data: payload
    }))
    this.broadcast(payload.id.split('/').slice(0,payload.id.split('/').length-2).join('/'), JSON.stringify({
      event:payload.id,
      data: payload
    }))
    return;
  }


}
