import React from 'react';

function stop(e) { e.stopPropagation(); }

const RightInputPlain = React.forwardRef(function RightInputPlain(props, ref) {
  const { className = '', ...rest } = props;
  return (
    <input
      ref={ref}
      type="text"
      onMouseDown={stop}
      onTouchStart={stop}
      className={`cw-right-input ${className}`}
      {...rest}
    />
  );
});

export default RightInputPlain;