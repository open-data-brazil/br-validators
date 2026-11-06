import { describe, expect, it } from 'vitest';

import { insertDataReleaseEntry } from './changelog-data-entry.js';

const ENTRY = { version: '1.10.1-data.35', date: '2026-11-05', bullet: '- Reference data refresh (daily bot).' };

describe('insertDataReleaseEntry', () => {
  it('moves Unreleased notes into the release and joins the existing Changed list', () => {
    const changelog = [
      '# Changelog',
      '',
      '## [Unreleased]',
      '',
      '### Changed',
      '',
      '- Release assets on GitHub.',
      '',
      '### Fixed',
      '',
      '- PTAX window.',
      '',
      '## [1.10.1-data.34] - 2026-11-04',
      '',
      '- old',
      '',
    ].join('\n');

    expect(insertDataReleaseEntry(changelog, ENTRY)).toBe(
      [
        '# Changelog',
        '',
        '## [Unreleased]',
        '',
        '## [1.10.1-data.35] - 2026-11-05',
        '',
        '### Changed',
        '',
        '- Reference data refresh (daily bot).',
        '- Release assets on GitHub.',
        '',
        '### Fixed',
        '',
        '- PTAX window.',
        '',
        '## [1.10.1-data.34] - 2026-11-04',
        '',
        '- old',
        '',
      ].join('\n'),
    );
  });

  it('creates a Changed section when Unreleased is empty', () => {
    const changelog = '# Changelog\n\n## [Unreleased]\n\n## [1.0.0] - 2026-01-01\n\n- old\n';
    expect(insertDataReleaseEntry(changelog, ENTRY)).toBe(
      '# Changelog\n\n## [Unreleased]\n\n## [1.10.1-data.35] - 2026-11-05\n\n### Changed\n\n- Reference data refresh (daily bot).\n\n## [1.0.0] - 2026-01-01\n\n- old\n',
    );
  });

  it('keeps notes without a Changed heading below the new Changed section', () => {
    const changelog = '## [Unreleased]\n\n### Fixed\n\n- x\n';
    expect(insertDataReleaseEntry(changelog, ENTRY)).toBe(
      '## [Unreleased]\n\n## [1.10.1-data.35] - 2026-11-05\n\n### Changed\n\n- Reference data refresh (daily bot).\n\n### Fixed\n\n- x\n\n',
    );
  });

  it('ignores "### Changed" quoted inside a bullet', () => {
    const changelog = '## [Unreleased]\n\n### Fixed\n\n- one `### Changed` list per release\n';
    expect(insertDataReleaseEntry(changelog, ENTRY)).toBe(
      '## [Unreleased]\n\n## [1.10.1-data.35] - 2026-11-05\n\n### Changed\n\n- Reference data refresh (daily bot).\n\n### Fixed\n\n- one `### Changed` list per release\n\n',
    );
  });

  it('rejects a changelog without an Unreleased section', () => {
    expect(() => insertDataReleaseEntry('# Changelog\n', ENTRY)).toThrow('Unreleased');
  });
});
