#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const desktopRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.join(desktopRoot, 'package.json');

const args = process.argv.slice(2);
const platformArg = args.find((arg) => arg.startsWith('--'));

const platformToBuilderTarget = {
  '--win': 'win',
  '--mac': 'mac',
  '--linux': 'linux',
};

const platformToExplicitTargets = {
  '--win': ['zip'],  // Use zip only (nsis has Windows path length issues, portable doesn't build)
  '--mac': ['dmg'],
  '--linux': ['AppImage'],
};

if (!platformArg || !platformToBuilderTarget[platformArg]) {
  console.error('Usage: node scripts/build-dev-release.cjs --win|--mac|--linux');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const baseVersionRaw = String(packageJson.version || '').trim();
const baseVersion = baseVersionRaw.split('-')[0];

if (!/^\d+\.\d+\.\d+$/.test(baseVersion)) {
  console.error(`Expected package version in major.minor.patch format, got: "${baseVersionRaw}"`);
  process.exit(1);
}

const now = new Date();
const timestamp = [
  now.getUTCFullYear(),
  String(now.getUTCMonth() + 1).padStart(2, '0'),
  String(now.getUTCDate()).padStart(2, '0'),
  String(now.getUTCHours()).padStart(2, '0'),
  String(now.getUTCMinutes()).padStart(2, '0'),
].join('');

const devVersion = `${baseVersion}-dev.${timestamp}`;
const builderTarget = platformToBuilderTarget[platformArg];
const explicitTargets = platformToExplicitTargets[platformArg] ?? [];

console.log(`Building ${builderTarget} dev release with version ${devVersion}`);

let electronBuilderCliPath;
try {
  electronBuilderCliPath = require.resolve('electron-builder/out/cli/cli.js', {
    paths: [desktopRoot],
  });
} catch (error) {
  console.error('Unable to resolve electron-builder CLI. Run "pnpm i" first.');
  console.error(error);
  process.exit(1);
}

const builderArgs = [
  electronBuilderCliPath,
  `--${builderTarget}`,
];

// electron-builder --win accepts target names as repeated values: --win nsis portable zip
for (const target of explicitTargets) {
  builderArgs.push(target);
}

builderArgs.push('--publish', 'never', `--config.extraMetadata.version=${devVersion}`);

const result = spawnSync(
  process.execPath,
  builderArgs,
  {
    cwd: desktopRoot,
    stdio: 'inherit',
    shell: false,
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
