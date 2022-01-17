import { copy } from 'fs-extra';
import { OPTION_COPIERS } from '../options/options.js';

export const TASK_NAME_COPY = '拷贝文件';

// TODO: 使用 "模板方法模式" 组织代码
// TODO: 解析文件中的依赖，检查是否有相对路径对应的文件并不在拷贝列表内
// TODO: 单独实现 `copy` 方法，移除对 "fs-extra" 的依赖
export default {
  name: TASK_NAME_COPY,
  async excute({ ctx, task }) {
    if (!ctx.error) {
      await Promise.all(
        ctx.payload.get(OPTION_COPIERS).map(
          (cur) =>
            new Promise((resolve, reject) => {
              copy(cur.source, cur.output, (err) => {
                if (err) {
                  reject(err);
                  return;
                }

                resolve(true);
              });
            }),
        ),
      );

      task.title = '已拷贝完所有文件';
    } else {
      task.skip('未能拷贝');
    }
  },
};
