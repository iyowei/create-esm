# $ create-esm [待拷贝的文件、文件夹] [选项]

> 这是一个命令行工具，给到 ESM 源码文件路径后，自动创建一个项目、打包、发布，确保一个指令即可在项目中安装使用，进而支持跨项目使用。

如果有频繁新建 ESM 项目的需求，这个脚手架会让这件事变得很轻松。

创建项目、配置项目... 想想还是很耗时、复杂的。简单来看，使用现有的生成器，都是生成一个项目，再增、改文件，再推送到代码仓库，再发布。这个过程，理想情况也得耗时个几分钟，足以打断思路、分散注意力，令人望而却步。

而日常开发活动中，我们都在开发具体的业务项目，不可能一次又一次地像上述一样创建项目，但我们编写的很多代码都的确可以模块化，发包以跨项目使用，但因为上述问题，我们一次次地不考虑这么做，或者催眠自己：等空闲了再做，因为的确有些本末倒置，如果影响到了本分工作，那就毁犊子了。

不过这个问题也不是不可解决。换个思路，我们在写项目代码时，模块化一段代码后，指定从这个代码文件，自动化创建并发布一个项目，即可。一个指令即可在创建项目、发包、在项目中安装使用，也可以跨项目使用，耗时小到几乎可以忽略，也就不存在本末倒置的问题了。

想象下，在项目中，你写好了一个功能，运行一个指令后，就可以在项目中运行 `npm i XXX` 安装这部分代码，整个耗时可能就几秒钟。

这么做的好处很多，

- 能复用的代码都从项目中独立了出去，所以项目里尽是业务代码，确保了业务代码的纯净度，可以从一定程度上提升业务推进的效率；
- 复审精度指数级提高；
- TDD 高度可行，系统的测试覆盖率指数级提高；
- 满足发包条件的模块，也必然是经过良好设计的，所以这又进一步反向提升了系统的质量；
- ......

## 目录

- [使用](#使用)
  - [根据命令行提示一步步操作](#根据命令行提示一步步操作)
  - [查看命令行参数说明](#查看命令行参数说明)
  - [使用命令行参数直接创建项目](#使用命令行参数直接创建项目)
  - [查看全局配置](#查看全局配置)
  - [更新全局配置](#更新全局配置)
  - [最佳实践](#最佳实践)
- [安装](#安装)
  - [NPM](#npm)
  - [PNPM](#pnpm)
  - [Yarn](#yarn)
- [参与贡献](#参与贡献)

## 使用

<!-- 脚手架做了哪些事？ -->

被生成的项目具有一下特征，

- ESM；
- 存在编码风格控制；
- TDD；
- Node.js >= v12.20.0；
- .vscode 配置；
- 默认使用 PNPM 包管理器；
- 包含基本结构的 README.md；（可以照模子画瓢）
- 开源；
- 在 Github 上托管源码；
- 发布在 NPM 上；

另外，如果项目要创建在 GitHub 组织下，或发布到特定 NPM 命名空间下，它们都需要被提前手动创建好。

### 根据命令行提示一步步操作

```shell
create-esm /Users/iyowei/Development/iyowei/create-esm/src/print.js
```

![Kapture 2021-12-16 at 21 24 14](https://user-images.githubusercontent.com/5499703/146546818-848b478e-90b7-4891-875d-b00a5dd143ee.gif)

> 必须提供待拷贝的文件、文件夹，否则执行结果类似于 `create-esm --help`。

### 查看命令行参数说明

运行 `create-esm` 或 `create-esm --help` 即可。

```shell
  使用方式
    $ create-esm [指定待拷贝的文件、文件夹] [选项]

  选项
    --name, -n                                 包名（实际安装时使用的名称）
    --description                              描述
    --output, -o                               新建项目的磁盘位置
    --dependencies, -d                         手动指定要安装的依赖
    --sshkey                                   私钥文件地址
    --no-double-check-dependencies             不需要二次确认是否还有其它依赖需要安装
    --no-confirm-github-org                    如果包名有命名空间，则确认是否需要在某个 Github Org 下创建项目

    --version, -v                              查看版本号
    --help, -h                                 查看帮助

  命令
    set                                        设置 create-esm 全局设置
    reset                                      清空 create-esm 全局设置
    defaults                                   查看 create-esm 全局设置

  示例
    $ create-esm
    $ create-esm /Users/iyowei/Development/generators/create-esm/src/notEmptyString.js
```

熟悉命令行参数后，相比交互式命令行界面下输入参数值，可选择命令行参数直供的方式，高效的多。

### 使用命令行参数直接创建项目

##### 在 [Github 个人账户][github personal] 下创建 [scoped][scoped] 包

```shell
create-esm \
/Users/iyowei/Development/iyowei/create-esm/src/lsDir.js \
/Users/iyowei/Development/iyowei/create-esm/src/README.md \ # 打包前，项目中每个模块都有自己的 README.md 文件，比较推荐
-n @iyowei/test-scan-dir \
--personal \
-p "并行扫描文件夹，可在扫描的同时更新或过滤数据，一定程度复用遍历。" \
-o "/Users/iyowei/Development/iyowei" \
--sshkey "~/.ssh/github" \
--no-double-check-dependencies
```

##### 在 **同名** [Github 组织][github org] 下创建 [scoped][scoped] 包

```shell
create-esm \
/Users/iyowei/Development/iyowei/create-esm/src/lsDir.js \
/Users/iyowei/Development/iyowei/create-esm/src/README.md \ # 打包前，项目中每个模块都有自己的 README.md 文件，比较推荐
-n @iyowei/test-scan-dir \
-p "并行扫描文件夹，可在扫描的同时更新或过滤数据，一定程度复用遍历。" \
-o "/Users/iyowei/Development/iyowei" \
--sshkey "~/.ssh/github" \
--no-double-check-dependencies
```

##### 在 **异名** [Github 组织][github org] 下创建 [unscoped][unscoped] 包

```shell
create-esm \
/Users/iyowei/Development/iyowei/create-esm/src/lsDir.js \
/Users/iyowei/Development/iyowei/create-esm/src/README.md \ # 打包前，项目中每个模块都有自己的 README.md 文件，比较推荐
-n test-scan-dir \
--github-org iyoha \
-p "并行扫描文件夹，可在扫描的同时更新或过滤数据，一定程度复用遍历。" \
-o "/Users/iyowei/Development/iyowei" \
--sshkey "~/.ssh/github" \
--no-double-check-dependencies
```

### 查看全局配置

```shell
create-esm defaults
```

### 更新全局配置

```shell
create-esm set [key] [value]
```

运行 `create-esm defaults` 了解具体有哪些全局配置。

### 最佳实践

- 打包前，项目中每个模块都有自己的 README.md 文件，比较推荐；

## 安装

[![Node Version Badge][node version badge]][download node.js] ![esm][esm]

依赖的工具有几个，部分操作没法儿自动化，不过好在这些事是一次性的，

- 安装 [PNPM][pnpm] 包管理器；（生成的项目统一使用 PNPM 管理）
- **安装 [Github Cli][github cli]，使用 [安全的 SSH 管道][安全的 ssh 管道] 选项 [登录][登录 github cli]**；（创建、推送、拉取 Github 项目等）
- [登录 NPM][登录 npm]；（发包）

公钥要添加到 Github 上，另外保存好秘钥位置，私钥要用来建立 [安全的 SSH 管道][安全的 ssh 管道]，"@iyowei/create-esm" 通过 `--sshkey` 命令行参数指定私钥，或者全局设置 `sshkey` 即可，运行 `create-esm set sshkey [私钥绝对路径]`。

另外，还有点基本的全局 Git 设置，创建项目、提交修改时需要，

- **`git config --global init.defaultBranch main`**；
- `git config —-global user.email “you@example.com”`；
- `git config --global user.name "Your Name"`；

安装 "@iyowei/create-esm"，

### NPM

```shell
npm i @iyowei/create-esm --global
```

### PNPM

```shell
pnpm add @iyowei/create-esm --global
```

### Yarn

```shell
yarn global add @iyowei/create-esm
```

上述都安装、配置好后，就可以顺利使用 "create-esm" 脚手架了。对了，**使用时得联网**。😃

## 参与贡献

![PRs Welcome][prs welcome badge]

[esm]: https://img.shields.io/badge/ESM-brightgreen?style=flat
[pnpm]: https://pnpm.io/zh/installation
[github cli]: https://cli.github.com/
[登录 github cli]: https://cli.github.com/manual/gh_auth_login
[登录 npm]: https://docs.npmjs.com/cli/v7/commands/npm-adduser
[安全的 ssh 管道]: https://docs.github.com/cn/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent
[node version badge]: https://img.shields.io/badge/node.js-%3E%3D12.20.0-brightgreen?style=flat&logo=Node.js
[download node.js]: https://nodejs.org/en/download/
[prs welcome badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat
[scoped]: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages
[unscoped]: https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages
[github org]: https://docs.github.com/cn/organizations/collaborating-with-groups-in-organizations/about-organizations
[github personal]: https://docs.github.com/cn/get-started/learning-about-github/types-of-github-accounts#personal-accounts

<!-- 更多文档细节，参考 https://github.com/iyowei/readme-templates -->
