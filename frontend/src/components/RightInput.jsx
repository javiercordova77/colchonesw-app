import React from 'react';
import { TextField } from '@mui/material';

function stop(e) { e.stopPropagation(); }

const RightInput = React.forwardRef(function RightInput(props, ref) {
  const { sx, InputProps, inputProps, inputRef, ...rest } = props;
  return (
    <TextField
      variant="standard"
      fullWidth
      {...rest}
      sx={{ minWidth: 0, ...sx }}
      InputProps={{
        disableUnderline: true,
        sx: { textAlign: 'right', '& input': { textAlign: 'right', padding: '6px 0' } },
        onMouseDown: stop,
        onTouchStart: stop,
        onClick: stop,
        ...InputProps
      }}
      inputRef={inputRef || ref}
      inputProps={{
        'aria-label': props['aria-label'] || 'input',
        autoComplete: 'off',
        inputMode: inputProps?.inputMode,
        ...inputProps
      }}
    />
  );
});

export default RightInput;