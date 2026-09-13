import { useState } from 'react'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'

export function PasswordField({
  autoComplete,
  error,
  fieldRegistration,
  helperText,
  id,
}) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <TextField
      autoComplete={autoComplete}
      error={error}
      fullWidth
      helperText={helperText}
      id={id}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        htmlInput: { className: 'auth-password-input' },
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                edge="end"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon />
                ) : (
                  <VisibilityOutlinedIcon />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
      {...fieldRegistration}
    />
  )
}
