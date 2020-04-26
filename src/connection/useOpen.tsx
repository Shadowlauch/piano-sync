import {useEffect, useState} from 'react';
import {ws} from '../index';

export const useOpen = () => {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleOpen = () => setOpen(true);

    const handleClose = () => setOpen(false);

    ws.addEventListener('open', handleOpen);
    ws.addEventListener('close', handleClose);

    return () => {
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('close', handleClose);
    }
  }, []);

  return open;
}
