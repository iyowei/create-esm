import { existsSync, realpathSync } from 'fs';

import isEmpty from 'lodash/isEmpty.js';
import validateNpmPkgName from 'validate-npm-package-name';
import isTildePath from '@iyowei/is-tilde-path';
import { untildify } from '@iyowei/untildify';

export const ARG_NAME = 'name';
export const ARG_DESCRIPTION = 'description';
export const ARG_OUTPUT = 'output';
export const ARG_SSH_KEY = 'sshkey';

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
