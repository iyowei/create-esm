import pkg from '@npmcli/package-json';
import shell from 'shelljs';
import { writeNpmRc } from '@iyowei/create-templates';
import isEmpty from 'lodash/isEmpty.js';

import {
  OPTION_NEW_PROJECT_PATH,
  OPTION_NAMESPACE,
  OPTION_DESCRIPTION,
  OPTION_BENCHMARK,
  OPTION_TDD,
  OPTION_PKG_EXPORTS,
  OPTION_PKG_FILES,
  OPTION_DEPENDENCIES,
  OPTION_DEV_DEPENDENCIES,
  OPTION_PRINTS,
} from '../options/options.js';

export const TASK_NAME_CREATE_NPM_PACKAGE = '初始化 NPM';

// TODO: 使用 "模板方法模式" 组织代码
export default {
  name: TASK_NAME_CREATE_NPM_PACKAGE,
  async excute({ ctx, task }) {
    if (!ctx.error) {
      const PART_NAME = '切换到新创建好的项目';

      task.title = PART_NAME;

      if (shell.cd(ctx.payload.get(OPTION_NEW_PROJECT_PATH)).code !== 0) {
        ctx.error = true;
        ctx.message = `"${TASK_NAME_CREATE_NPM_PACKAGE}" 任务在 "${PART_NAME}" 环节出错`;
      }
    }

    if (!ctx.error) {
      const PART_NAME = '生成 package.json';

      task.title = PART_NAME;

      const excuted = shell.exec(
        isEmpty(ctx.payload.get(OPTION_NAMESPACE))
          ? 'npm init -y'
          : `npm init --scope=${ctx.payload.get(OPTION_NAMESPACE)} -y`,
        {
          silent: true,
        },
      );

      if (excuted.code !== 0) {
        ctx.error = true;
        ctx.message = [
          `"${TASK_NAME_CREATE_NPM_PACKAGE}" 任务在 "${PART_NAME}" 环节出错,`,
        ].concat(excuted.stderr.split('\n'));
      } else {
        const pkgIns = await pkg.load(ctx.payload.get(OPTION_NEW_PROJECT_PATH));

        const TMP = {
          // 包
          type: 'module',
          exports: ctx.payload.get(OPTION_PKG_EXPORTS).relativePath,
          main: ctx.payload.get(OPTION_PKG_EXPORTS).bareRelativePath,
          files: ctx.payload.get(OPTION_PKG_FILES),
          engines: {
            node: '>=12.20.0',
          },

          // 脚手架
          scripts: {
            format:
              "npx prettier '**/*.{js,mjs,json,md}' --write --loglevel error",
            lint: 'npx eslint "**/*.{js,mjs}"',
          },

          // 基本信息
          description: ctx.payload.get(OPTION_DESCRIPTION),

          // 公开
          private: false,
          publishConfig: {
            access: 'public',
          },
          keywords: ['iyowei'],
          license: 'MIT',
        };

        if (ctx.payload.get(OPTION_TDD)) {
          TMP.scripts.test = "npx mocha '**/*.+(spec|test).js' -p";
        }

        if (ctx.payload.get(OPTION_BENCHMARK)) {
          TMP.scripts.benchmark = 'node ./benchmark.js';
        }

        pkgIns.update(TMP);
        delete pkgIns.content.author;

        await pkgIns.save();
      }
    }

    if (!ctx.error) {
      const PART_NAME = '其它异步生成任务';

      task.title = PART_NAME;

      await Promise.all([
        // 生成 .npmrc
        new Promise((resolve, reject) => {
          writeNpmRc({
            output: ctx.payload.get(OPTION_PRINTS).npmrc.output,
            data: { namespace: ctx.payload.get(OPTION_NAMESPACE) },
          }).then(
            () => {
              resolve();
            },
            (err) => {
              reject(err);
            },
          );
        }),

        // 安装生产依赖
        new Promise((resolve, reject) => {
          const DEPs = ctx.payload.get(OPTION_DEPENDENCIES);

          if (DEPs.length !== 0) {
            const excuted = shell.exec(`pnpm add ${DEPs.join(' ')}`, {
              silent: true,
            });

            if (excuted.code !== 0) {
              reject(excuted.stderr);
              return;
            }

            resolve(true);
            return;
          }

          resolve(true);
        }),

        // 安装开发依赖
        new Promise((resolve, reject) => {
          const DevDEPs = ctx.payload.get(OPTION_DEV_DEPENDENCIES);

          if (DevDEPs.length !== 0) {
            const excuted = shell.exec(`pnpm add ${DevDEPs.join(' ')} -D`, {
              silent: true,
            });

            if (excuted.code !== 0) {
              reject(excuted.stderr);
              return;
            }

            resolve(true);
            return;
          }

          resolve(true);
        }),
      ]).catch(() => {
        ctx.error = true;
        ctx.message = `"${TASK_NAME_CREATE_NPM_PACKAGE}" 任务在 ${PART_NAME} 任务环节出错`;
      });
    }

    if (ctx.error) {
      task.skip('未能成功初始化 NPM');
    } else {
      task.title = '成功初始化 NPM';
    }
  },
};
