const moduleOptions = {
  merchantCode: process.env.TWOCHECKOUT_MERCHANT_CODE,
  ipInfoKey: process.env.IPINFO_KEY,
  vendor3DSReturnURL: 'https://www.abc123.com',
  vendor3DSCancelURL: 'https://www.abc123.com',
  cardStyle: {
    'body': {
      margin: 0
    },
    '*': {
      boxSizing: 'border-box'
    },
    '.row': {
      display: 'flex'
    },
    '.col': {
      flex: '1 1 100%',
      margin: '0.25rem 0.25rem 0.5rem'
    },
    '.field-wrapper, .control-label, .form-control, .validation-message': {
      fontFamily: 'Nunito, -apple-system, BlinkMacSystemFont, Arial, sans-serif',
      lineHeight: 1.65
    },
    '.validation-message': {
      display: 'block',
      color: '#d13608',
      fontSize: '0.675rem',
      marginTop: '0.25rem'
    },
    '.field-wrapper': {
      position: 'relative'
    },
    '.form-control': {
      padding: 'calc(3.25em / 2 - (2rem * 3 / 4) / 2) 0.75em 1px 0.75em',
      height: '3.25em',
      boxShadow: 'none',
      maxWidth: '100%',
      width: '100%',
      backgroundColor: '#fdfcfa',
      border: '1px solid #d1d0cd',
      borderRadius: '2px',
      color: '#A09F98',
      fontSize: '1em'
    },
    '.form-control:focus': {
      borderColor: '#fcc28c'
    },
    '.is-error .form-control': {
      borderColor: '#d13608'
    },
    '.control-label': {
      display: 'block',
      position: 'absolute',
      color: '#494633',
      top: '0.25em',
      left: '1em',
      fontSize: 'calc(1rem * 3 / 4)',
      backgroundColor: 'transparent',
      zIndex: 5
    }
  }
}