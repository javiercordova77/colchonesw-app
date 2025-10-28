import React from 'react';

function stop(e) { e.stopPropagation(); }

const RightInputUncontrolled = React.forwardRef(function RightInputUncontrolled(props, ref) {
  const { defaultValue, onCommit, className = '', type = 'text', ...rest } = props;
  const inputRef = React.useRef(null);
  React.useImperativeHandle(ref, () => inputRef.current);

  const handleBlur = (e) => {
    onCommit?.(e.target.value ?? '');
  };

  return (
    <input
      ref={inputRef}
      type={type}
      className={`cw-right-input ${className}`}
      defaultValue={defaultValue ?? ''}
      onBlur={handleBlur}
      onMouseDown={stop}
      onTouchStart={stop}
      autoComplete="off"
      {...rest}
    />
  );
});

export default RightInputUncontrolled;