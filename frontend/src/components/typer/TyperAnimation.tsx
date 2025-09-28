import React from 'react'
import { TypeAnimation } from 'react-type-animation';
const TyperAnimation = () => {
  return (
    <TypeAnimation
      sequence={[
        // Same substring at the start will only be typed out once, initially
        'Currently, Gemini 1.5 models have been retired.',
        2000, // wait 1s before replacing "Mice" with "Hamsters"
        ' Gemini 2.5 Flash is the upgraded version of Gemini 1.5 Flash but requires paid access.',
        2000,
        'Currently the chat functionality is not available. It will be up once a free-tier alternative is found.',
        1500,
      ]}
      wrapper="span"
      speed={50}
      style={{ fontSize: '60px', color:"white",display: 'inline-block', textShadow:"1px 1px 20px #000" }}
      repeat={Infinity}
    />
  );

};

export default TyperAnimation;