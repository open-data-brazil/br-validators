/** Coerce a rejected promise value into an `Error` without using `any` or `unknown`. */
export function toError(reason: Error | string | number | boolean | object): Error {
  if (reason instanceof Error) {
    return reason;
  }
  if (typeof reason === 'string') {
    return new Error(reason);
  }
  if (typeof reason === 'number' || typeof reason === 'boolean') {
    return new Error(String(reason));
  }
  return new Error(JSON.stringify(reason));
}

export function exitWithError(reason: Error | string | number | boolean | object): never {
  console.error(toError(reason));
  process.exit(1);
}
