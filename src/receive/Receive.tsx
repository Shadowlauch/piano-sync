import React, {FC, useEffect, useState} from 'react';
import {RouteComponentProps} from '@reach/router';
import {Piano} from '../piano/Piano';
import {useOpen} from '../connection/useOpen';
import {ws} from '../index';

interface ReceiveProps extends RouteComponentProps {
  hostId?: string;
}

export const Receive: FC<ReceiveProps> = ({hostId}) => {
  const [keysPressed, setKeysPressed] = useState<number[]>([]);
  const open = useOpen();
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !hostId) return;

    ws.send(JSON.stringify({
      type: 'join',
      id: hostId
    }));

    const handleMessage = (message: MessageEvent) => {
      const data = JSON.parse(message.data);

      if (data.type === 'sync') {
        setKeysPressed(data.keys);
      } else if (data.type === 'host:disconnect') {
        setConnected(false);
      } else if (data.type === 'joined') {
        setConnected(true);
      }
    };

    ws.addEventListener<"message">('message', handleMessage);
    return () => {
      ws.removeEventListener('message', handleMessage);
    };
  }, [hostId, open]);

  return (
    <div>
      <div>HostId: {hostId}</div>
      <div>Connected: {connected}</div>
      <Piano pressedKeys={keysPressed} />
    </div>
  );
};
