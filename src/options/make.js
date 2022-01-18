/**
 * TODO: 将所有的文案、消息等都迁移到 messages.js 文件中
 * TODO: 参数构造过程模块化
 */

import { basename, extname, join } from 'path';
import { statSync, existsSync, readFileSync } from 'fs';
import { log } from 'console';

import notEmptyString from '@iyowei/not-empty-string';
import alphaSort from 'alpha-sort';
import isScoped from 'is-scoped';
import shell from 'shelljs';
import chalk from 'chalk'; // eslint-disable-line
import prompts from 'prompts';
import isReadmePath from '@iyowei/is-readme-path';
import precinct from 'detective-es6';
import { isESMSync } from '@iyowei/is-esm';
import isEmpty from 'lodash/isEmpty.js';

import { prints, copiers, stockrooms } from '@iyowei/create-templates';

import jsModuleDependenciesToBeInstalled from '@iyowei/js-module-dependencies-to-be-installed';
import { HINT_NO_FILE_INPUT, hints } from '../messages.js';
import { getGlobalConfigurations } from './global.js';
import terminateCli from '../terminateCli.js';
import questions from './questions.js';

import {
  OPTIONS,
  OPTION_RULES,
  OPTION_NAME,
  OPTION_NAMESPACE,
  OPTION_COPIERS,
  OPTION_PKG_EXPORTS,
  OPTION_PKG_FILES,
  OPTION_TARGETS,
  OPTION_OUTPUT,
  OPTION_PKG_NAME,
  OPTION_DEPENDENCIES,
  OPTION_DEV_DEPENDENCIES,
  OPTION_GENERATE_README,
  OPTION_GITHUB_ORG_NAME_SAME_WITH_NPM_ORG,
  OPTION_GITHUB_ORG,
  OPTION_TDD,
  OPTION_BENCHMARK,
  OPTION_BREAKPOINT,
  OPTION_DOUBLE_CHECK_DEPENDENCIES,
  OPTION_PERSONAL,
  OPTION_NEW_PROJECT_PATH,
  OPTION_PRINTS,
  OPTION_GITIGNORE
} from './options.js';

const questioners = [];
const ext = ['.js', '.mjs'];

function hasReadme(paths = []) {
  return paths.some(isReadmePath);
}

function getJSTypeFileInputs(inputs) {
  return inputs.filter(
    (cur) => cur.dirent.isFile() && ext.includes(extname(cur.path)),
  );
}

function treatDependencies(cli) {
  // 解析 JS 文件中的需要安装依赖
  const scaned = Array.from(
    new Set(
      cli.input
        .filter((cur) => ext.includes(extname(cur)))
        .map((cur) => {
          const specifiers = precinct(readFileSync(cur, 'utf-8'));
          return jsModuleDependenciesToBeInstalled(specifiers);
        })
        .flat(),
    ),
  );

  if (!isEmpty(scaned)) {
    OPTIONS.set(OPTION_DEPENDENCIES, scaned);
  }

  // 即使命令行中已指定，但仍需要二次确认的参数，除非要求，否则交互式提问用户
  if (!isEmpty(cli.flags[OPTION_DEPENDENCIES])) {
    OPTIONS.set(
      OPTION_DEPENDENCIES,
      Array.from(new Set([...scaned, ...cli.flags[OPTION_DEPENDENCIES]])),
    );
  }

  if (cli.flags[OPTION_DOUBLE_CHECK_DEPENDENCIES]) {
    questioners.push({
      type: 'list',
      separator: ' ',
      initial: '',
      name: OPTION_DEPENDENCIES,
      message: isEmpty(OPTIONS.get(OPTION_DEPENDENCIES))
        ? '未指定需要安装的依赖，如果需要，以空格间隔输入'
        : `将安装 ${OPTIONS.get(OPTION_DEPENDENCIES).reduce(
            (acc, cur) => (!acc ? `"${cur}"` : `${acc}、"${cur}"`),
            '',
          )}，如果需要指定更多，以空格间隔输入`,
    });
  }
}

function treatInputs(cli) {
  if (isEmpty(cli.input)) {
    terminateCli('请指定文件、文件夹');
  }

  const inputsExist = cli.input.filter((cur) => !existsSync(cur));

  // 校验输入文件中是否有不存在的
  if (!isEmpty(inputsExist)) {
    log(`
  ${chalk.redBright.bold('以下输入的文件不存在，请检查是否输入有误，')}
  ${inputsExist.reduce(
    (acc, cur) => (!acc ? `- ${cur}` : `${acc}\n  - ${cur}`),
    '',
  )}
      `);

    shell.exit(1);
  }

  // ==========================================================================>

  const inputs = cli.input.map((cur) => ({
    path: cur,
    name: basename(cur),
    dirent: statSync(cur),
  }));

  if (isEmpty(getJSTypeFileInputs(inputs))) {
    terminateCli(hints[HINT_NO_FILE_INPUT]);
  }

  // ==========================================================================>

  const existNonESMFile = cli.input
    .filter((cur) => ext.includes(extname(cur)))
    .some((cur) => !isESMSync(cur));

  if (existNonESMFile) {
    terminateCli('仅适用 ESM 模块文件');
  }

  // ==========================================================================>

  if (!isEmpty(cli.flags[OPTION_GITHUB_ORG]) && cli.flags[OPTION_PERSONAL]) {
    terminateCli('`--personal`、`--github-org` 两个参数不能同时出现');
  }

  // ==========================================================================>

  if (!hasReadme(cli.input)) {
    OPTIONS.set(OPTION_GENERATE_README, true);
  }

  // ==========================================================================>

  const rootFiles = inputs.filter((cur) => cur.dirent.isFile());

  // 输入文件集合中存在非 JS 文件时，让用户选择发包时需要包含的文件
  if (rootFiles.some((cur) => !ext.includes(extname(cur.name)))) {
    questioners.push({
      type: 'multiselect',
      name: OPTION_PKG_FILES,
      message: '选择发包时需要包含的文件',
      choices: inputs.map((cur) => ({
        title: cur.name,
        value: cur.dirent.isDirectory()
          ? `${basename(cur.path)}/**`
          : `${basename(cur.path)}`,
      })),
      instructions: false,
    });
  } else {
    OPTIONS.set(
      OPTION_PKG_FILES,
      inputs.map((cur) =>
        cur.dirent.isDirectory()
          ? `${basename(cur.path)}/**`
          : `${basename(cur.path)}`,
      ),
    );
  }

  OPTIONS.set(OPTION_TARGETS, inputs);

  const jsFileTypeInputs = getJSTypeFileInputs(inputs);

  if (jsFileTypeInputs.length === 1) {
    const jsInput = jsFileTypeInputs[0];
    OPTIONS.set(
      OPTION_PKG_EXPORTS,
      Object.assign(jsInput, {
        relativePath: `./${jsInput.name}`,
        bareRelativePath: jsInput.name,
      }),
    );
  } else {
    // 有多份文件，此时需要用户指定将哪份文件作为导出文件
    questioners.push({
      name: OPTION_PKG_EXPORTS,
      type: 'select',
      choices: jsFileTypeInputs.reduce((acc, cur) => {
        const { name, path, dirent } = cur;

        acc.push({
          title: name,
          value: {
            path,
            relativePath: `./${name}`,
            bareRelativePath: name,
            dirent,
            name,
          },
        });

        return acc;
      }, []),
      message: '选择 NPM 包导出文件',
      instructions: false,
    });
  }
}

// 部分 ”交互式提问“ 自动根据某些参数是否提供、是否有默认值等特征出现或隐藏
function treatArgsWithQuestionIfNotGiven(cli) {
  const defaults = getGlobalConfigurations();

  Object.entries(OPTION_RULES).forEach((kv) => {
    const arg = kv[0];
    const { cliRequired, isDefault } = kv[1];

    // 必需参数，使用命令行中提供的配置，未提供的情况下交互式提问用户
    if (cliRequired) {
      if (!cli.flags[arg]) {
        questioners.push(questions[arg]);
      } else if (
        OPTION_RULES[arg].format &&
        Object.prototype.toString.call(OPTION_RULES[arg].format) !==
          '[object Function]'
      ) {
        OPTIONS.set(arg, OPTION_RULES[arg].format(cli.flags[arg]));
      } else {
        OPTIONS.set(arg, cli.flags[arg]);
      }
    }

    // 非必需参数，优先使用命令行中提供的配置，其次是系统默认配置，如果未设置系统默认配置，就交互式提问用户
    if (!cliRequired) {
      if (cli.flags[arg]) {
        OPTIONS.set(
          arg,
          Object.prototype.toString.call(OPTION_RULES[arg].format) !==
            '[object Function]'
            ? cli.flags[arg]
            : OPTION_RULES[arg].format(cli.flags[arg]),
        );
      } else if (isDefault && !defaults[arg]) {
        questioners.push(questions[arg]);
      } else {
        OPTIONS.set(arg, defaults[arg]);
      }
    }
  });
}

export default async function make(cli) {
  treatInputs(cli);

  treatArgsWithQuestionIfNotGiven(cli);

  treatDependencies(cli);

  // 有问题就显示交互式界面提问用户，questioners 更新相关的参数处理必须在前面
  if (!isEmpty(questioners)) {
    const rslt = await prompts(questioners, {
      onCancel: () => {
        shell.exit(1);
      },
    });

    Object.entries(rslt).forEach((cur) => {
      const k = cur[0];
      const v = cur[1];

      OPTIONS.set(k, v);
    });
  }

  [
    [
      OPTION_NAME,
      isScoped(OPTIONS.get(OPTION_NAME))
        ? OPTIONS.get(OPTION_NAME).split('/')[1]
        : OPTIONS.get(OPTION_NAME),
    ],
    [OPTION_PKG_NAME, OPTIONS.get(OPTION_NAME)],
    [
      OPTION_NEW_PROJECT_PATH,
      isScoped(OPTIONS.get(OPTION_NAME))
        ? join(
            OPTIONS.get(OPTION_OUTPUT),
            OPTIONS.get(OPTION_NAME).split('/')[1],
          )
        : join(OPTIONS.get(OPTION_OUTPUT), OPTIONS.get(OPTION_NAME)),
    ],
    [
      OPTION_DEPENDENCIES,
      OPTIONS.get(OPTION_DEPENDENCIES)
        .filter((cur) => notEmptyString(cur))
        .sort(alphaSort()),
    ],
    [
      OPTION_NAMESPACE,
      isScoped(OPTIONS.get(OPTION_NAME))
        ? OPTIONS.get(OPTION_NAME).split('/')[0].substring(1)
        : '',
    ],
  ].forEach((cur) => {
    const k = cur[0];
    const v = cur[1];
    OPTIONS.set(k, v);
  });

  /**
   * 包名
   *
   * 检测到命名空间
   *
   * `--github-org` 有值否
   * - 有，在不同名的 Github Org 下创建项目，
   * - 空，到底是在同名 Github Org 下创建还是创建到个人名下，取决于是否选择了个人名下，
   *   - true，创建到个人名下
   *   - false，创建到同名 Github Org 下
   *
   * 未检测到命名空间,
   *
   * `--github-org` 有值否
   * - 有，在特定 Github Org 下创建项目，
   * - 空，创建到个人名下
   *
   * `--github-org` 为不同名 Github Org 存在
   * `--personal` 因为 `--github-org` 可能为空存在
   *
   * 两者不能同时出现
   */
  if (isEmpty(OPTIONS.get(OPTION_NAMESPACE))) {
    // no namespace
    if (!isEmpty(cli.flags[OPTION_GITHUB_ORG])) {
      // has github org
      OPTIONS.set(OPTION_GITHUB_ORG, cli.flags[OPTION_GITHUB_ORG]);
    }
  } else if (!isEmpty(cli.flags[OPTION_GITHUB_ORG])) {
    // has namespace, has github org
    OPTIONS.set(OPTION_GITHUB_ORG, cli.flags[OPTION_GITHUB_ORG]);
  } else if (!cli.flags[OPTION_PERSONAL]) {
    // has namespace, no github org, not personal
    OPTIONS.set(OPTION_GITHUB_ORG_NAME_SAME_WITH_NPM_ORG, true);
  }

  if (cli.flags[OPTION_TDD]) {
    OPTIONS.set(
      OPTION_DEV_DEPENDENCIES,
      OPTIONS.get(OPTION_DEV_DEPENDENCIES).concat(['mocha']),
    );
    OPTIONS.set(OPTION_TDD, cli.flags[OPTION_TDD]);
  }

  if (cli.flags[OPTION_BENCHMARK]) {
    OPTIONS.set(
      OPTION_DEV_DEPENDENCIES,
      OPTIONS.get(OPTION_DEV_DEPENDENCIES).concat(['benchmark', 'microtime']),
    );
    OPTIONS.set(OPTION_BENCHMARK, cli.flags[OPTION_BENCHMARK]);
  }

  OPTIONS.set(
    OPTION_COPIERS,
    [
      ...OPTIONS.get(OPTION_TARGETS)
        .map((cur) => cur.path)
        .map((cur) => ({
          source: cur,
          output: join(OPTIONS.get(OPTION_NEW_PROJECT_PATH), basename(cur)),
        })),
      ...copiers.common.map((cur) => ({
        source: cur,
        output: join(OPTIONS.get(OPTION_NEW_PROJECT_PATH), basename(cur)),
      })),
      ...copiers.esm.map((cur) => ({
        source: cur,
        output: join(OPTIONS.get(OPTION_NEW_PROJECT_PATH), basename(cur)),
      })),

      cli.flags[OPTION_TDD] && {
        source: copiers.mocha,
        output: join(OPTIONS.get(OPTION_NEW_PROJECT_PATH), basename(copiers.mocha)),
      },

      // TODO: 如果用户已编写性能测试脚本，此处默认脚本的生成就是一种困扰了，默认脚本生成策略需再思考
      // cli.flags[OPTION_BENCHMARK] && {
      //   source: copiers[OPTION_BENCHMARK],
      //   output: join(
      //     OPTIONS.get(OPTION_NEW_PROJECT_PATH),
      //     basename(copiers[OPTION_BENCHMARK]),
      //   ),
      // },
    ].filter(Boolean),
  );

  OPTIONS.set(
    OPTION_PRINTS,
    Object.entries(prints).reduce((acc, cur) => {
      const k = cur[0];
      const v = cur[1];

      acc[k] = {
        source: v,
        output: join(OPTIONS.get(OPTION_NEW_PROJECT_PATH), basename(v)),
      };

      return acc;
    }, {}),
  );

  OPTIONS.set(OPTION_GITIGNORE, {
    source: stockrooms[OPTION_GITIGNORE],
    output: join(OPTIONS.get(OPTION_NEW_PROJECT_PATH), '.gitignore'),
  });

  if (cli.flags[OPTION_BREAKPOINT]) {
    OPTIONS.set(OPTION_BREAKPOINT, cli.flags[OPTION_BREAKPOINT]);
  }

  return OPTIONS.getAll();
}
