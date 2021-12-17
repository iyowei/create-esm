import shell from "shelljs";
import boxen from "boxen";

export default function terminateCli(msg) {
  shell.echo(
    boxen(msg, {
      padding: 1,
      borderColor: "red",
    })
  );

  shell.exit(1);
}
