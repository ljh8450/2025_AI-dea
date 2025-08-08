import React from 'react';
import AuroraBG from './AuroraBG';
import RippleBG from './RippleBG';

const SceneBG = ({ effect = 'aurora', variant = 'light', interactive = true }) => {
  if (effect === 'ripple') {
    return <RippleBG interactive={interactive} variant={variant} />;
  }
  return <AuroraBG interactive={interactive} variant={variant} />;
};

export default SceneBG;
