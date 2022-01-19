import { join } from 'path';
import { homedir } from 'os';
import { existsSync, realpathSync } from 'fs';

import { writeJsonFileSync } from 'write-json-file';
import { loadJsonFileSync } from 'load-json-file';

import { getText, TXT_NAME } from '../messages.js';
import terminateCli from '../terminateCli.js';
import { OPTION_RULES, OPTION_OUTPUT, OPTION_SSH_KEY } from './options.js';

const PERSISTENT_OPTIONS = {
  [OPTION_OUTPUT]: '',
  [OPTION_SSH_KEY]: '',
};

export const PERSISTENT_OPTIONS_FILE_PATH = join(
  homedir(),
  `${getText(TXT_NAME)}-defaults.json`,
);

// 每次都获取最新的配置
export function getPersistentConfigurations() {
  return existsSync(PERSISTENT_OPTIONS_FILE_PATH)
    ? loadJsonFileSync(PERSISTENT_OPTIONS_FILE_PATH)
    : PERSISTENT_OPTIONS;
}

// TODO: 键有效性校验
export function updatePersistentConfigurations(key, value) {
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

  const defaults = getPersistentConfigurations();

  // TODO: value 被设置前未格式化，如果输入的是波浪号路径
  Object.assign(defaults, { [key]: realpathSync(value) });

  writeJsonFileSync(PERSISTENT_OPTIONS_FILE_PATH, defaults);
}

export function resetPersistentConfigurations() {
  writeJsonFileSync(PERSISTENT_OPTIONS_FILE_PATH, PERSISTENT_OPTIONS);
}
