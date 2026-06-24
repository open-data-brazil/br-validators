#!/usr/bin/env node
/**
 * Git publish helper for the daily data refresh bot.
 *
 * Modes:
 *   release — commit data + version bump, push main + tag (direct) or open PR (fallback)
 *   reports — commit refresh reports only, push main or open PR
 *
 * Direct push requires secret DATA_REFRESH_GITHUB_TOKEN (PAT with bypass) or branch
 * protection bypass for github-actions[bot]. Otherwise opens a PR; tag is pushed by
 * data-refresh-tag-on-merge.yml after the PR merges.
 */
import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function run(command, options = {}) {
  execSync(command, { cwd: ROOT, encoding: 'utf8', stdio: options.inherit ? 'inherit' : 'pipe', ...options });
}

function runOptional(command) {
  try {
    return run(command);
  } catch {
    return null;
  }
}

function parseArgs(argv) {
  const modeIndex = argv.indexOf('--mode');
  if (modeIndex === -1 || argv[modeIndex + 1] === undefined) {
    throw new Error('--mode release|reports is required');
  }
  const mode = argv[modeIndex + 1];
  if (mode !== 'release' && mode !== 'reports') {
    throw new Error(`Invalid mode: ${mode}`);
  }

  const versionIndex = argv.indexOf('--version');
  const tagIndex = argv.indexOf('--tag');
  const reasonIndex = argv.indexOf('--reason');

  const envReason = process.env.DATA_REFRESH_REASON;
  const cliReason = reasonIndex === -1 ? undefined : argv[reasonIndex + 1];

  return {
    mode,
    version: versionIndex === -1 ? undefined : argv[versionIndex + 1],
    tag: tagIndex === -1 ? undefined : argv[tagIndex + 1],
    reason: envReason !== undefined && envReason.length > 0 ? envReason : cliReason,
    directPush: argv.includes('--direct-push'),
  };
}

function configureGit() {
  run('git config user.name "github-actions[bot]"');
  run('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
}

function buildReleaseMessage(version, reason) {
  if (reason !== undefined && reason.length > 0) {
    return `chore(release): data refresh PATCH v${version} — ${reason}`;
  }
  return `chore(release): data refresh PATCH v${version}`;
}

async function readPrBody() {
  try {
    return await readFile(path.join(ROOT, 'data/refresh-reports/pr-body.md'), 'utf8');
  } catch {
    return 'Automated data refresh — see `data/refresh-reports/latest.json`.';
  }
}

function stageFiles(mode) {
  if (mode === 'release') {
    run('git add -A');
    return;
  }
  run('git add data/refresh-reports docs/DATA-FRESHNESS.md');
}

function hasStagedChanges() {
  try {
    run('git diff --staged --quiet', { stdio: 'pipe' });
    return false;
  } catch {
    return true;
  }
}

function tryPushMain() {
  try {
    run('git push origin HEAD:main');
    return true;
  } catch {
    return false;
  }
}

function pushTag(tag) {
  run(`git tag -a ${JSON.stringify(tag)} -m ${JSON.stringify(`Release ${tag} — data refresh`)}`);
  run(`git push origin ${JSON.stringify(tag)}`);
}

function createBranchName(mode, version) {
  const date = new Date().toISOString().slice(0, 10);
  if (mode === 'release') {
    return `bot/data-release/v${version}-${date}`;
  }
  return `bot/data-reports/${date}`;
}

async function openPullRequest(mode, version, branch) {
  const title =
    mode === 'release'
      ? `chore(release): data refresh PATCH v${version}`
      : `chore(data): daily refresh reports ${new Date().toISOString().slice(0, 10)}`;

  const body = await readPrBody();
  const baseCmd = `gh pr create --base main --head ${JSON.stringify(branch)} --title ${JSON.stringify(title)} --body ${JSON.stringify(body)}`;
  let prUrl;
  try {
    prUrl = run(`${baseCmd} --label data-refresh${mode === 'release' ? ' --label automated-release' : ''}`).trim();
  } catch {
    prUrl = run(baseCmd).trim();
  }

  runOptional(`gh pr merge ${JSON.stringify(branch)} --auto --merge`);
  return prUrl;
}

async function writeOutputs(values) {
  const lines = Object.entries(values)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  console.log(lines);
  if (process.env.GITHUB_OUTPUT) {
    const { appendFile } = await import('node:fs/promises');
    await appendFile(process.env.GITHUB_OUTPUT, `${lines}\n`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.mode === 'release') {
    if (args.version === undefined || args.tag === undefined) {
      throw new Error('--version and --tag are required for release mode');
    }
  }

  configureGit();
  stageFiles(args.mode);

  if (!hasStagedChanges()) {
    await writeOutputs({ publish_method: 'none', committed: 'false' });
    console.log('No staged changes — nothing to publish.');
    return;
  }

  const commitMessage =
    args.mode === 'release'
      ? buildReleaseMessage(args.version, args.reason)
      : `chore(data): daily refresh reports ${new Date().toISOString().slice(0, 10)}`;

  run(`git commit -m ${JSON.stringify(commitMessage)}`);

  if (args.directPush && tryPushMain()) {
    if (args.mode === 'release') {
      pushTag(args.tag);
    }
    await writeOutputs({
      publish_method: 'direct',
      committed: 'true',
      tagged: args.mode === 'release' ? 'true' : 'false',
    });
    console.log(`Direct push to main succeeded${args.mode === 'release' ? `; tag ${args.tag} pushed` : ''}.`);
    return;
  }

  const branch = createBranchName(args.mode, args.version ?? '0.0.0');
  run(`git checkout -b ${JSON.stringify(branch)}`);
  run(`git push -u origin ${JSON.stringify(branch)}`);
  const prUrl = await openPullRequest(args.mode, args.version ?? '0.0.0', branch);

  await writeOutputs({
    publish_method: 'pr',
    committed: 'true',
    tagged: 'false',
    pr_url: prUrl,
    branch,
  });

  console.log(`Branch protection blocked direct push — opened PR: ${prUrl}`);
  if (args.mode === 'release') {
    console.log('Tag v* will be pushed automatically after the PR merges (data-refresh-tag-on-merge.yml).');
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
