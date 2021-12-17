import shell from "shelljs";
import boxen from "boxen";
import isEmpty from "lodash/isEmpty.js";

import { rules as argsRules } from "./args.js";
import terminateCli from "../terminateCli.js";

const DEFAULTS = new Map(
  Object.entries({
    targets: [],
    name: "",
    pkgName: "",
    description: "",
    generateReadme: false,
    pkgFiles: [],
    pkgExports: {},
    output: "",
    newProjectPath: "",
    namespace: "",
    sshkey: "",
    dependencies: [],
    githubOrgNameSameWithNpmOrg: false,
    githubOrgName: "",
  })
);

const KEY_STORE = Symbol();

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
