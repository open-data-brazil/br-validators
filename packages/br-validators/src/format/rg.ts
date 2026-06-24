import type { ValidateRgOptions } from '../core/rg/index.js';
import { formatRg as formatRgCore } from '../core/rg/index.js';

export function formatRg(input: string, options: ValidateRgOptions): ReturnType<typeof formatRgCore> {
  return formatRgCore(input, options);
}
