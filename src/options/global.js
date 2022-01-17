// TODO: 重命名为 "持久化配置"

import { join } from 'path';
import { homedir } from 'os';
import { existsSync, realpathSync } from 'fs';

import { writeJsonFileSync } from 'write-json-file';
import { loadJsonFileSync } from 'load-json-file';

import { getText, TXT_NAME } from '../messages.js';
import terminateCli from '../terminateCli.js';
import { OPTION_RULES, OPTION_OUTPUT, OPTION_SSH_KEY } from './options.js';

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
  if (key === OPTION_OUTPUT) {
    const result = OPTION_RULES[OPTION_OUTPUT].validate(value);

    if (!result.ok) {
      terminateCli(result.message);
    }
  }

  if (key === OPTION_SSH_KEY) {
    const result = OPTION_RULES[OPTION_SSH_KEY].validate(value);

    if (!result.ok) {
      terminateCli(result.message);
    }
  }

  const defaults = getGlobalConfigurations();

  // TODO: value 被设置前未格式化，如果输入的是波浪号路径
  Object.assign(defaults, { [key]: realpathSync(value) });

  writeJsonFileSync(defaultsFilePath, defaults);
}

export function reset() {
  writeJsonFileSync(defaultsFilePath, GLOBAL_DEFAULTS);
}
