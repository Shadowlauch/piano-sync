import React, {FC} from 'react';
import './Piano.scss';
import classNames from 'classnames';

const blackKeys = [1, 4, 6, 9, 11, 13, 16, 18, 21, 23, 25, 28, 30, 33, 35, 37, 40, 42, 45, 47, 49, 52, 54, 57, 59, 61, 64, 66, 69, 71, 73, 76, 78, 81, 83, 85];

interface PianoProps {
  pressedKeys: number[];
}

export const Piano: FC<PianoProps> = ({pressedKeys}) => {
  return (
    <div className={'piano'}>
      {Array(88).fill(0).map((v, i) => {
        const isBlack = blackKeys.includes(i);
        const isPressed = pressedKeys.includes(i);

        return (<div key={i} className={classNames('note', isBlack && 'black', !isBlack && 'white', isPressed && 'pressed')}/>);
      })}
    </div>
  );
}
