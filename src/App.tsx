import React from 'react';
import {Router} from '@reach/router';
import {Host} from './host/Host';
import {Receive} from './receive/Receive';

export const App = () => {
  return (
    <Router>
      <Host path={'/host'} />
      <Receive path={'/join/:hostId'} />
    </Router>
  );
};
