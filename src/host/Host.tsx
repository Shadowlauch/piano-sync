import React, {FC, useEffect, useState} from 'react';
import {RouteComponentProps} from '@reach/router';
import {Midi} from '../midi/Midi';
import {ws} from '../index';
import { v4 as uuidv4 } from 'uuid';
import {useOpen} from '../connection/useOpen';

const hostId = uuidv4();

export const Host: FC<RouteComponentProps> = () => {
  const [keysPressed, setKeysPressed] = useState<number[]>([]);
  const [connectionCount, setConnectionCount] = useState<number>(0);
  const open = useOpen();

  useEffect(() => {
    if (!open) return;

    ws.send(JSON.stringify({
      type: 'host',
      id: hostId
    }));
  }, [open]);

  const handleKeyChange = (keys: number[]) => {
    setKeysPressed(keys);

    if (open) {
      ws.send(JSON.stringify({
        type: 'sync',
        keys: keys
      }));
    }
  }

  useEffect(() => {
    if (!open) return;

    const handleMessage = (message: MessageEvent) => {
      const data = JSON.parse(message.data);

      if (data.type === 'client:connect' || data.type === 'client:disconnect') {
        setConnectionCount(data.count);
      }
    };

    ws.addEventListener<"message">('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [open]);

  return (
    <div>
      <div>{hostId && open && <a href={`http://${window.location.host}/join/${hostId}`}>http://{window.location.host}/join/{hostId}</a>}</div>
      <div>Connected Clients: {connectionCount}</div>
      <Midi keysPressed={keysPressed} onKeysChange={handleKeyChange}/>
    </div>
  );
};
