import {PeerJSOption} from 'peerjs';

export const peerConfig: PeerJSOption = {
  config: {'iceServers': [
      { urls: 'stun:stun.l.google.com:19302' }
    ]} /* Sample servers, please use appropriate ones */
};
