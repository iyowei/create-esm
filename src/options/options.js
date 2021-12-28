import isEmpty from 'lodash/isEmpty.js';

import {
  rules as argsRules,
  ARG_BREAKPOINT,
  ARG_NAME,
  ARG_DESCRIPTION,
  ARG_OUTPUT,
  ARG_DEPENDENCIES,
  ARG_SSH_KEY,
  ARG_GITHUB_ORG,
} from './args.js';
import terminateCli from '../terminateCli.js';

const DEFAULTS = new Map(
  Object.entries({
    targets: [],

    [ARG_NAME]: '',
    pkgName: '',
    [ARG_DESCRIPTION]: '',
    pkgFiles: [],
    pkgExports: {},

    devDependencies: [
      'eslint',
      'eslint-config-prettier',
      'eslint-plugin-import',
      'eslint-config-airbnb-base',
      'prettier',
    ],
    [ARG_DEPENDENCIES]: [],

    namespace: '',

    generateReadme: false,
    tdd: false,

    // 默认在个人 Github 账户下创建项目
    githubOrgNameSameWithNpmOrg: false,
    [ARG_GITHUB_ORG]: '',

    [ARG_OUTPUT]: '',
    newProjectPath: '',

    [ARG_SSH_KEY]: '',

    copiers: [],
    prints: {},
    gitignore: {},
    [ARG_BREAKPOINT]: '',
  }),
);

const KEY_STORE = Symbol('key store');

export default {
  [KEY_STORE]: DEFAULTS,
  set(key, value) {
    const rule = argsRules[key];

    if (!isEmpty(rule) && !isEmpty(rule.validate)) {
      const validateResult = rule.validate(value);

      if (!validateResult.ok) {
        terminateCli(validateResult.message);
      } else {
        this[KEY_STORE].set(key, value);
      }
    } else {
      this[KEY_STORE].set(key, value);
    }
  },
  get(key) {
    return this[KEY_STORE].get(key);
  },
  getAll() {
    return this[KEY_STORE];
  },
};
