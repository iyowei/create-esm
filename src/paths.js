import { join } from "path";
import { callsiteHomeSync } from "@iyowei/callsite-home";

import { getText, TXT_NAME } from "./messages.js";

export const TPL_DIR = join(callsiteHomeSync(getText(TXT_NAME)), "tpl");

export const TPL_NPMRC = join(TPL_DIR, ".npmrc");

export const TPL_GITIGNORE = join(TPL_DIR, "gitignore");

export const TPL_README = join(TPL_DIR, "README.md");

export const TPL_DOT_VSCODE = join(TPL_DIR, ".vscode");

export function getOutputPathGitignore(newProjectPath) {
  return join(newProjectPath, ".gitignore");
}

export function getOutputPathPackageJson(newProjectPath) {
  return join(newProjectPath, "package.json");
}

export function getOutputPathNpmRC(newProjectPath) {
  return join(newProjectPath, ".npmrc");
}

export function getOutputPathREADME(newProjectPath) {
  return join(newProjectPath, "README.md");
}

export function getOutputDotVSCode(newProjectPath) {
  return join(newProjectPath, ".vscode");
}
