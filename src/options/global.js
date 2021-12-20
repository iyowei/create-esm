import { join } from 'path';
import { homedir } from 'os';
import { existsSync, realpathSync } from 'fs';

import { writeJsonFileSync } from 'write-json-file';
import { loadJsonFileSync } from 'load-json-file';
import shell from 'shelljs';
import boxen from 'boxen';

import { getText, TXT_NAME } from '../messages.js';
import terminateCli from '../terminateCli.js';

const GLOBAL_DEFAULTS = {
  output: '',
  sshkey: '',
};

export const defaultsFilePath = join(
  homedir(),
  `${getText(TXT_NAME)}-defaults.json`,
);

// 每次都获取最新的配置
export function getGlobalConfigurations() {
  return existsSync(defaultsFilePath)
    ? loadJsonFileSync(defaultsFilePath)
    : GLOBAL_DEFAULTS;
}

// TODO: 键有效性校验
export function updateGlobalConfigurations(key, value) {
  if (key === 'output' && !existsSync(value)) {
    terminateCli(`给定磁盘位置 "${value}" 不存在`);
  }

  if (key === 'sshkey' && !existsSync(value)) {
    terminateCli(`给定路径 "${value}" 未检测到私钥文件`);
  }

  const defaults = getGlobalConfigurations();
  Object.assign(defaults, { [key]: realpathSync(value) });

  writeJsonFileSync(defaultsFilePath, defaults);
}

export function reset() {
  writeJsonFileSync(defaultsFilePath, GLOBAL_DEFAULTS);
}
