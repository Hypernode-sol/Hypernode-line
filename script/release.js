#!/usr/bin/env node

import { exec, execSync } from 'child_process';
import { createReadStream, statSync, existsSync } from 'fs';
import path from 'path';
import request from 'request';
import { fileURLToPath } from 'url';
import { version } from '../package.json';

const token = process.env.hypernodeline_TOKEN;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

checkToken()
  //.then(checkHerokuLoginStatus)
  .then(zipAssets)
  .then(createRelease)
  .then(uploadAssets)
  .then(publishRelease)
  //.then(deployToHeroku)
  .catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });

function checkToken() {
  if (!token) {
    return Promise.reject(
      'hypernodeline_TOKEN environment variable not set\nSet it to a token with repo scope created from https://github.com/settings/tokens/new'
    );
  }
  return Promise.resolve(token);
}

function zipAsset(asset) {
  return new Promise((resolve, reject) => {
    const assetBase = path.basename(asset.path);
    const assetDirectory = path.dirname(asset.path);
    console.log(`Zipping ${assetBase} to ${asset.name}`);

    if (!existsSync(asset.path)) {
      return reject(new Error(`${asset.path} does not exist`));
    }

    const zipCommand = `zip --recurse-paths --symlinks '${asset.name}' '${assetBase}'`;
    const options = { cwd: assetDirectory, maxBuffer: Infinity };

    exec(zipCommand, options, (error) => {
      if (error) {
        reject(error);
      } else {
        asset.path = path.join(assetDirectory, asset.name);
        resolve(asset);
      }
    });
  });
}

function zipAssets() {
  const outPath = path.join(__dirname, '..', 'out');

  const zipAssets = [
    { name: 'hypernodeline-mac.zip', path: path.join(outPath, 'hypernodeline-darwin-x64', 'hypernodeline.app') },
    { name: 'hypernodeline-windows.zip', path: path.join(outPath, 'hypernodeline-win32-x64') },
