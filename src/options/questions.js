import crypto from 'crypto';
import { existsSync } from 'fs';
import { homedir } from 'os';

import validateNpmPkgName from 'validate-npm-package-name';
import isEmpty from 'lodash/isEmpty.js';

import {
  OPTION_NAME,
  OPTION_DESCRIPTION,
  OPTION_OUTPUT,
  OPTION_SSH_KEY,
} from './options.js';

// 静态问题
export default {
  [OPTION_NAME]: {
    type: 'text',
    name: [OPTION_NAME],
    initial: crypto.randomBytes(16).toString('hex'),
    message: '项目名',

    // TODO: 检查包名唯一性
    validate: (value) =>
      validateNpmPkgName(`esm-${value}`).validForNewPackages
        ? true
        : `英文，无特殊字符，可使用 "-"、"_"、"." 组合多个单词`,
  },
  [OPTION_DESCRIPTION]: {
    type: 'text',
    name: [OPTION_DESCRIPTION],
    initial: '',
    message: '是什么？干了什么？解决了什么问题？描述下',
  },
  [OPTION_OUTPUT]: {
    type: 'text',
    name: [OPTION_OUTPUT],
    initial: homedir(), // 命令行、系统默认配置都未提供，默认提供用户根目录
    message: '请提供新建项目的位置，不包括项目名',
    validate: (value) => (existsSync(value) ? true : '磁盘位置不存在'),
  },
  [OPTION_SSH_KEY]: {
    type: 'text',
    name: [OPTION_SSH_KEY],
    initial: '',
    message: '必须提供私钥（绝对路径）建立安全 SSH 管道',
    validate: (value) => {
      if (!isEmpty(value)) {
        if (existsSync(value)) {
          return true;
        }
        return '给定路径未检测到私钥文件';
      }
      return '未提供私钥文件';
    },
  },
};
