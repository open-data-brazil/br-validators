import { afterEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../src/program.js';
import * as handlers from '../src/handlers.js';

describe('registerReferenceLookupCommands via createProgram', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('wires ncm validate subcommand to handler', async () => {
    const handleSpy = vi.spyOn(handlers, 'handleReferenceValidateCli').mockReturnValue(0);
    const writeSpy = vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['ncm', 'validate', '01012100', '--json'], { from: 'user' });
    expect(handleSpy).toHaveBeenCalledWith(
      'ncm',
      '01012100',
      expect.objectContaining({ json: true }),
      expect.objectContaining({ stdout: expect.any(Array), stderr: expect.any(Array) }),
    );
    expect(writeSpy).toHaveBeenCalled();
  });

  it('wires cst subcommands to handlers', async () => {
    const lookupSpy = vi.spyOn(handlers, 'handleCstLookupCli').mockReturnValue(0);
    const searchSpy = vi.spyOn(handlers, 'handleCstSearchCli').mockReturnValue(0);
    const validateSpy = vi.spyOn(handlers, 'handleCstValidateCli').mockReturnValue(0);
    vi.spyOn(handlers, 'writeCliIo').mockImplementation(() => undefined);
    const program = createProgram();
    await program.parseAsync(['cst', 'lookup', '00', '--tax', 'icms'], { from: 'user' });
    await program.parseAsync(['cst', 'search', 'tributada', '--tax', 'icms'], { from: 'user' });
    await program.parseAsync(['cst', 'validate', '00', '--tax', 'icms'], { from: 'user' });
    expect(lookupSpy).toHaveBeenCalled();
    expect(searchSpy).toHaveBeenCalled();
    expect(validateSpy).toHaveBeenCalled();
  });
});
