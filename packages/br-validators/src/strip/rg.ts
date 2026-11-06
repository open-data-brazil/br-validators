import type { ValidateRgOptions } from '../core/rg/index.js';
import { stripRg as stripRgCore } from '../core/rg/index.js';

export function stripRg(input: string, options: ValidateRgOptions): string {
  return stripRgCore(input, options);
}
