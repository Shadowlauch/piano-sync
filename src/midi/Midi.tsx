import React, {ChangeEventHandler, FC, useEffect, useState} from 'react';
import WebMidi, {Input, InputEventControlchange, InputEventNoteoff, InputEventNoteon} from 'webmidi';
import {Piano} from '../piano/Piano';
import {useEventCallback} from '@restart/hooks';

interface MidiProps {
  keysPressed: number[];
  onKeysChange: (keys: number[]) => void;
}

export const Midi: FC<MidiProps> = ({keysPressed, onKeysChange}) => {
  const [inputs, setInputs] = useState<Input[]>([]);
  const [activeInputId, setActiveInputId] = useState<string | undefined>(undefined);
  const [pedal, setPedal] = useState<boolean>(false);

  useEffect(() => {
    WebMidi.enable(() => {
      const updateInputs = () => {
        setInputs(WebMidi.inputs);
        console.log(WebMidi.inputs)

        if (activeInputId !== undefined && WebMidi.inputs.findIndex(i => i.id === activeInputId) === -1) {
          setActiveInputId(undefined);
        } else if (activeInputId === undefined && WebMidi.inputs.length > 0) {
          setActiveInputId(WebMidi.inputs[0].id);
        }
      };

      WebMidi.addListener('connected', updateInputs);
      WebMidi.addListener('disconnected', updateInputs);

      return () => {
        WebMidi.removeListener('connected', updateInputs);
        WebMidi.removeListener('disconnected', updateInputs);
      };
    });
  }, [activeInputId]);

  const toggleNote = useEventCallback((e: InputEventNoteon | InputEventNoteoff) => {
    console.log(e, keysPressed);
    const number = e.note.number - 21;

    if (e.type === "noteon" && !keysPressed.includes(number)) {
      onKeysChange([...keysPressed, number]);
    } else if (e.type === "noteoff" && keysPressed.includes(number)) {
      const index = keysPressed.indexOf(number);
      keysPressed.splice(index, 1)
      onKeysChange([...keysPressed]);
    }
  });

  useEffect(() => {
    const activeInput = inputs.find(i => i.id === activeInputId);

    if (!activeInput) return;

    const togglePedal = (e: InputEventControlchange) => {
      if (e.controller.number >= 64) setPedal(e.value > 0);
    };

    activeInput.addListener('noteon', 'all', toggleNote);
    activeInput.addListener('noteoff', 'all', toggleNote);
    activeInput.addListener('controlchange', 'all', togglePedal);

    return () => {
      activeInput.removeListener('noteon', 'all', toggleNote);
      activeInput.removeListener('noteoff', 'all', toggleNote);
      activeInput.removeListener('controlchange', 'all', togglePedal);
    };
  }, [activeInputId, inputs, toggleNote]);


  const handleActiveInputChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    setActiveInputId(e.target.value);
  };


  return (
    <div className={'container'}>
      {<select placeholder={'Select Input'} onChange={handleActiveInputChange} value={activeInputId}>
        {inputs.map(i => <option value={i.id} key={i.id}>{i.name}</option>)}
      </select>}
      <div>
        {pedal && 'x'}
        {!pedal && 'o'}
      </div>
      <Piano pressedKeys={keysPressed}/>
    </div>
  );
};
