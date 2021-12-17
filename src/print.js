import { writeFileSync, readFileSync } from "fs";
import template from "lodash/template.js";

export default function print({ outputPath, templatePath, data, options = {} }) {
  writeFileSync(
    outputPath,
    template(readFileSync(templatePath, { encoding: "utf-8" }), options)(data)
  );
}
