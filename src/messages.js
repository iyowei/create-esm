import { basename } from 'path';

import chalk from 'chalk';
import gradient from 'gradient-string';
import figlet from 'figlet';

import isEmpty from 'lodash/isEmpty.js';

export const TXT_NAME = 'name';

export const texts = {
  [TXT_NAME]: 'create-esm',
};

export function getText(key) {
  return texts[key];
}

export const mainHelp = `
  ${chalk.bold('使用方式')}
    $ ${texts[TXT_NAME]} [指定待拷贝的文件、文件夹] [选项]

  ${chalk.bold('选项')}
    --name, -n                       包名（实际安装时使用的名称）
    --description                    描述
    --output, -o                     新建项目的磁盘位置
    --dependencies, -d               手动指定要安装的依赖
    --no-double-check-dependencies   不需要二次确认是否还有其它依赖需要安装
    --sshkey, -k                     私钥文件地址
    --personal                       包名有命名空间时，指定在 Github 个人账户下创建项目
    --github-org                     包名有命名空间但与 Github 组织名不同时需特别指定，默认在与命名空间同名的 Github 组织下创建项目

    --version, -v                    查看版本号
    --help, -h                       查看帮助

  ${chalk.bold('命令')}
    set                              设置 ${texts[TXT_NAME]} 全局配置
    reset                            清空 ${texts[TXT_NAME]} 全局配置
    defaults                         查看 ${texts[TXT_NAME]} 全局配置

  ${chalk.bold('示例')}
    $ ${texts[TXT_NAME]}
    $ ${
      texts[TXT_NAME]
    } /Users/iyowei/Development/generators/create-esm/src/notEmptyString.js
`;

export const setupHelp = `
  使用方式
    $ ${texts[TXT_NAME]} set [键] [值]

  示例
    $ ${texts[TXT_NAME]} set output /Users/iyowei/Development/shortime
`;

export const defaultsHelp = `
  查看 @iyowei/create-esm 全局配置

  示例
    $ ${texts[TXT_NAME]} defaults
`;

export const resetHelp = `
  重置 @iyowei/create-esm 全局配置

  示例
    $ ${texts[TXT_NAME]} reset
`;

export const HINT_NO_FILE_INPUT = 'nfi';

export const hints = {
  [HINT_NO_FILE_INPUT]: chalk.redBright(
    `无法确定 NPM 包导出文件，请重新输入，应${chalk.underline(
      '全是文件，或文件、文件夹的组合',
    )}。`,
  ),
};

export const COMMAND_SET = 'set';
export const COMMAND_DEFAULTS = 'defaults';
export const COMMAND_RESET = 'reset';

export const banner = `\n${chalk.bold(
  gradient.rainbow(
    figlet.textSync('Scaffold!', {
      font: 'Ghost',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 100,
      whitespaceBreak: true,
    }),
  ),
)}\n`;

export const getReport = (opts) => {
  let f = `
  即将在 ${chalk.greenBright.bold(
    opts.get('output'),
  )} 位置创建 ${chalk.greenBright.bold(opts.get('name'))} 项目。

  待拷贝，
${opts.get('targets').reduce((acc, cur) => {
  return !acc
    ? `- ${chalk.greenBright.bold(basename(cur.path))}, ${chalk.grey(cur.path)}`
    : `${acc}\n- ${chalk.greenBright.bold(basename(cur.path))}, ${chalk.grey(
        cur.path,
      )}`;
}, '')}\n
  `;

  // 如果 `opts.dependencies` 有效，才显示 "需要安装的依赖有这些" 部分
  if (!isEmpty(opts.get('dependencies'))) {
    f += `需要安装的依赖有这些，
${opts.get('dependencies').reduce((acc, cur) => {
  return !acc
    ? `- ${chalk.greenBright.bold(cur)}`
    : `${acc}\n- ${chalk.greenBright.bold(cur)}`;
}, '')}\n
  `;
  }

  f += chalk.yellowBright.bold(
    '按 [ctrl + c] 终止，或按其它 [任意] 键继续... \n',
  );

  return f;
};
