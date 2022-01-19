import { existsSync } from 'fs';

import isNil from 'lodash/isNil.js';
import isEmpty from 'lodash/isEmpty.js';
import validateNpmPkgName from 'validate-npm-package-name';
import isTildePath from '@iyowei/is-tilde-path';
import { untildify } from '@iyowei/untildify';

import terminateCli from '../terminateCli.js';

export const OPTION_TARGETS = 'targets';
export const OPTION_NAME = 'name';
export const OPTION_PKG_NAME = 'pkgName';
export const OPTION_PKG_FILES = 'pkgFiles';
export const OPTION_PKG_EXPORTS = 'pkgExports';
export const OPTION_DEV_DEPENDENCIES = 'devDependencies';
export const OPTION_NAMESPACE = 'namespace';
export const OPTION_GENERATE_README = 'generateReadme';
export const OPTION_GITHUB_ORG_NAME_SAME_WITH_NPM_ORG =
  'githubOrgNameSameWithNpmOrg';
export const OPTION_NEW_PROJECT_PATH = 'newProjectPath';
export const OPTION_COPIERS = 'copiers';
export const OPTION_PRINTS = 'prints';
export const OPTION_GITIGNORE = 'gitignore';
export const OPTION_DESCRIPTION = 'description';
export const OPTION_OUTPUT = 'output';
export const OPTION_SSH_KEY = 'sshkey';
export const OPTION_DEPENDENCIES = 'dependencies';
export const OPTION_DOUBLE_CHECK_DEPENDENCIES = 'doubleCheckDependencies';
export const OPTION_PERSONAL = 'personal';
export const OPTION_GITHUB_ORG = 'githubOrg';
export const OPTION_TDD = 'tdd';
export const OPTION_VERSION = 'version';
export const OPTION_HELP = 'help';
export const OPTION_BREAKPOINT = 'breakpoint';
export const OPTION_BENCHMARK = 'benchmark';

function fsPathFormatter(path) {
  if (isTildePath(path)) {
    return untildify(path);
  }

  return path;
}

// 部分 ”交互式提问“ 自动根据某些参数是否提供、是否有默认值等特征出现或隐藏
export const OPTION_RULES = {
  [OPTION_NAME]: {
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
  [OPTION_DESCRIPTION]: {
    isDefault: false,
    cliRequired: true,
    hint: '必须提供 description 参数',
  },
  [OPTION_OUTPUT]: {
    isDefault: true,
    cliRequired: false,
    hint: '未提供 output 参数，且没有默认配置，请提供',
    validate: (value) => {
      // TODO: 自动格式化 value，别处使用时就不需要每次手动调用 format 函数了
      if (!existsSync(value) || isEmpty(value)) {
        return { ok: false, message: `给定磁盘位置 "${value}" 不存在` };
      }
      return { ok: true };
    },
    format: fsPathFormatter,
  },
  [OPTION_SSH_KEY]: {
    isDefault: true,
    cliRequired: false,
    hint: '未提供 sshkey 参数，且没有默认配置，请提供',
    validate: (value) => {
      // TODO: 自动格式化 value，别处使用时就不需要每次手动调用 format 函数了
      if (!existsSync(value) || isEmpty(value)) {
        return { ok: false, message: `给定路径 "${value}" 未检测到私钥文件` };
      }
      return { ok: true };
    },
    format: fsPathFormatter,
  },
};

const DEFAULTS = Symbol('defaults');

export const OPTIONS = {
  [DEFAULTS]: new Map(
    Object.entries({
      [OPTION_TARGETS]: [],

      [OPTION_NAME]: '',
      [OPTION_PKG_NAME]: '',
      [OPTION_DESCRIPTION]: '',
      [OPTION_PKG_FILES]: [],
      [OPTION_PKG_EXPORTS]: {},

      [OPTION_DEV_DEPENDENCIES]: [
        'eslint',
        'eslint-config-prettier',
        'eslint-plugin-import',
        'eslint-config-airbnb-base',
        'prettier',
      ],
      [OPTION_DEPENDENCIES]: [],

      [OPTION_NAMESPACE]: '',

      [OPTION_GENERATE_README]: false,
      [OPTION_TDD]: false,
      [OPTION_BENCHMARK]: false,

      // 默认在个人 Github 账户下创建项目
      [OPTION_GITHUB_ORG_NAME_SAME_WITH_NPM_ORG]: false,
      [OPTION_GITHUB_ORG]: '',

      [OPTION_OUTPUT]: '',
      [OPTION_NEW_PROJECT_PATH]: '',

      [OPTION_SSH_KEY]: '',

      [OPTION_COPIERS]: [],
      [OPTION_PRINTS]: {},
      [OPTION_GITIGNORE]: {},
      [OPTION_BREAKPOINT]: '',
    }),
  ),
  set(key, value) {
    const rule = OPTION_RULES[key];

    if (!isNil(rule)) {
      if (
        rule.validate &&
        Object.prototype.toString.call(rule.validate) === '[object Function]'
      ) {
        const validateResult = rule.validate(value);

        if (!validateResult.ok) {
          terminateCli(validateResult.message);
        } else {
          this[DEFAULTS].set(key, value);
        }
      } else {
        this[DEFAULTS].set(key, value);
      }
    } else {
      this[DEFAULTS].set(key, value);
    }
  },
  get(key) {
    return this[DEFAULTS].get(key);
  },
  getAll() {
    return this[DEFAULTS];
  },
};

export const CLI_FLAGS = {
  [OPTION_BREAKPOINT]: {
    type: 'string',
    alias: 'b',
  },
  [OPTION_NAME]: {
    type: 'string',
    alias: 'n',
  },
  [OPTION_DESCRIPTION]: {
    type: 'string',
  },
  [OPTION_OUTPUT]: {
    type: 'string',
    alias: 'o',
  },
  [OPTION_DEPENDENCIES]: {
    isMultiple: true,
    type: 'string',
    alias: 'd',
  },
  [OPTION_DOUBLE_CHECK_DEPENDENCIES]: {
    type: 'boolean',
    default: true,
  },
  [OPTION_SSH_KEY]: {
    type: 'string',
    alias: 'k',
  },
  [OPTION_PERSONAL]: {
    type: 'boolean',
    default: false,
  },
  [OPTION_GITHUB_ORG]: {
    type: 'string',
  },
  [OPTION_TDD]: {
    type: 'boolean',
    default: false,
  },
  [OPTION_BENCHMARK]: {
    type: 'boolean',
    default: false,
  },
  [OPTION_VERSION]: {
    type: 'boolean',
    alias: 'v',
  },
  [OPTION_HELP]: {
    type: 'boolean',
    alias: 'h',
  },
};
