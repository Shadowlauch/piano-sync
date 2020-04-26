import {Server, MessageEvent} from 'ws';

const server = new Server({ port: 9002 });

type Client = MessageEvent["target"];

interface Room {
  host: Client;
  clients: Client[];
  id: string;
}

const rooms: Record<string, Room> = {};

server.addListener('connection', (client) =>  {
  let room: Room;
  let isHost = false;

  client.addEventListener("message", (message) => {
    const data = JSON.parse(message.data);

    if (data.type === 'host') {
      room = {
        host: client,
        clients: [],
        id: data.id
      };

      isHost = true;

      rooms[data.id] = room;
    } else if (data.type === 'join') {
      if (!rooms.hasOwnProperty(data.id)) return;

      room = rooms[data.id];
      room.clients.push(client);

      send(client, {
        type: 'joined'
      });
      send(room.host, {
        type: 'client:connect',
        count: room.clients.length
      });
    } else if (data.type === 'sync') {
      sendToAll(room.clients, message.data);
    }
  });

  client.addEventListener('close', () => {
    if (isHost) {
      sendToAll(room.clients, {
        type: 'host:disconnect'
      });

      delete rooms[room.id];
    } else {
      send(room.host, {
        type: 'client:disconnect',
        count: room.clients.length
      });

      const clientIndex = room.clients.findIndex(c => c === client);
      if (clientIndex !== -1) {
        room.clients = [...room.clients.slice(0, clientIndex), ...room.clients.slice(clientIndex + 1)];
      }
    }
  });
});

const send = (client: Client, message: any) => {
  client.send(typeof message === "string" ? message : JSON.stringify(message));
};

const sendToAll = (clients: Client[], message: any) => {
  for (const client of clients) {
    send(client, message);
  }
};
