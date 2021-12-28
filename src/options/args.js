import { existsSync, realpathSync } from 'fs';

import isEmpty from 'lodash/isEmpty.js';
import validateNpmPkgName from 'validate-npm-package-name';
import isTildePath from '@iyowei/is-tilde-path';
import { untildify } from '@iyowei/untildify';

export const ARG_NAME = 'name';
export const ARG_DESCRIPTION = 'description';
export const ARG_OUTPUT = 'output';
export const ARG_SSH_KEY = 'sshkey';
export const ARG_DEPENDENCIES = 'dependencies';
export const ARG_DOUBLE_CHECK_DEPENDENCIES = 'doubleCheckDependencies';
export const ARG_PERSONAL = 'personal';
export const ARG_GITHUB_ORG = 'githubOrg';
export const ARG_TDD = 'tdd';
export const ARG_VERSION = 'version';
export const ARG_HELP = 'help';
export const ARG_BREAKPOINT = 'breakpoint';

export const CLI_FLAGS = {
  [ARG_BREAKPOINT]: {
    type: 'string',
    alias: 'b',
  },
  [ARG_NAME]: {
    type: 'string',
    alias: 'n',
  },
  [ARG_DESCRIPTION]: {
    type: 'string',
  },
  [ARG_OUTPUT]: {
    type: 'string',
    alias: 'o',
  },
  [ARG_DEPENDENCIES]: {
    isMultiple: true,
    type: 'string',
    alias: 'd',
  },
  [ARG_DOUBLE_CHECK_DEPENDENCIES]: {
    type: 'boolean',
    default: true,
  },
  [ARG_SSH_KEY]: {
    type: 'string',
    alias: 'k',
  },
  [ARG_PERSONAL]: {
    type: 'boolean',
    default: false,
  },
  [ARG_GITHUB_ORG]: {
    type: 'string',
  },
  [ARG_TDD]: {
    type: 'boolean',
    default: false,
  },
  [ARG_VERSION]: {
    type: 'boolean',
    alias: 'v',
  },
  [ARG_HELP]: {
    type: 'boolean',
    alias: 'h',
  },
};

// 部分 ”交互式提问“ 自动根据某些参数是否提供、是否有默认值等特征出现或隐藏
export const rules = {
  [ARG_NAME]: {
    isDefault: false,
    cliRequired: true,
    hint: '必须提供 name 参数',

    /**
     * 问题：
     * 检查包名在 NPM 唯一性、Github 唯一性（如果指定了
     * 组织，就是组织内唯一性，如果是创建在用户名下，就是
     * 用户名下唯一性，不是指 Github 整站唯一性）
     *
     * 思考：
     * 检查唯一新、报错，都会终止程序，且都已经请求过网路，
     * 所以不如直接报错来终止程序
     */
    validate: (value) => {
      // console.log('value', value);

      if (!validateNpmPkgName(value).validForNewPackages) {
        return { ok: false, message: `包名 "${value}" 不合法` };
      }
      return { ok: true };
    },
  },
  [ARG_DESCRIPTION]: {
    isDefault: false,
    cliRequired: true,
    hint: '必须提供 description 参数',
  },
  [ARG_OUTPUT]: {
    isDefault: true,
    cliRequired: false,
    hint: '未提供 output 参数，且没有默认配置，请提供',
    validate: (value) => {
      if (!existsSync(value) || isEmpty(value)) {
        return { ok: false, message: `给定磁盘位置 "${value}" 不存在` };
      }
      return { ok: true };
    },
    format: (path) => {
      if (isTildePath(path)) {
        return untildify(path);
      }

      return realpathSync(path);
    },
  },
  [ARG_SSH_KEY]: {
    isDefault: true,
    cliRequired: false,
    hint: '未提供 sshkey 参数，且没有默认配置，请提供',
    validate: (value) => {
      if (!existsSync(value) || isEmpty(value)) {
        return { ok: false, message: `给定路径 "${value}" 未检测到私钥文件` };
      }
      return { ok: true };
    },
    format: (path) => {
      if (isTildePath(path)) {
        return untildify(path);
      }

      return realpathSync(path);
    },
  },
};
