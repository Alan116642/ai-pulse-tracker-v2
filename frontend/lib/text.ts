export function looksBrokenText(value: string | undefined) {
  if (!value) {
    return true;
  }
  return /[锟铰わ繝�]/.test(value) || /[鏃鍔鍥绯鏈娴寮鐧闃鑵]/.test(value) || /\?{2,}/.test(value);
}

export function cleanText(value: string | undefined, fallback: string) {
  if (!value || looksBrokenText(value)) {
    return fallback;
  }
  return value;
}
