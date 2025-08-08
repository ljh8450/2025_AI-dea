import React from 'react';
import AuroraBG from './AuroraBG';
import RippleBG from './RippleBG';

/**
 * AmbientBG: Aurora(아래) + Ripple(위) 레이어링
 * - Ripple은 backgroundMode="transparent"로 설정하여 Aurora를 가리지 않음
 */
const AmbientBG = ({
  variant = 'light',
  interactive = true,
  rippleTrail = false,
  auroraOpacity = 0.9,
  rippleOpacity = 1,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0" style={{ opacity: auroraOpacity }}>
        <AuroraBG interactive={interactive} variant={variant} />
      </div>
      <div className="absolute inset-0" style={{ opacity: rippleOpacity }}>
        <RippleBG
          interactive={interactive}
          variant={variant}
          trail={rippleTrail}
          backgroundMode="transparent"  // ★ 핵심: Aurora 위에서 투명 배경으로
        />
      </div>
    </div>
  );
};

export default AmbientBG;
