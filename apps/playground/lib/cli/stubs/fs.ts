/** Browser stub — file reads are unavailable in the playground CLI. */
export function readFileSync(): never {
  throw new Error('ENOENT');
}

export function existsSync(): boolean {
  return false;
}
