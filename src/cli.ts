import { Command } from "commander";
import { matcher } from "./matcher";
import { parse } from "./parser";
import fs from "node:fs";

const program = new Command();
const pkg = JSON.parse(fs.readFileSync("../package.json", "utf8"));

program
  .name(pkg.name)
  .description("lint and match robots.txt")
  .version(pkg.version);

program
  .command("lint")
  .description("lint robots.txt")
  .argument("<robots.txt>", "input path to robots.txt")
  .action((robotsTxt: string) => {
    try {
      parse(fs.readFileSync(robotsTxt));
      console.log(`${robotsTxt} looks fine.`);
    } catch (err) {
      console.log(err instanceof Error ? err.message : err);
    }
  });

program
  .command("match")
  .description("robots.txt parser and matcher")
  .argument("<robots.txt>", "input path to robots.txt")
  .argument("<user-agent>", "access user agent string")
  .argument("<path>", "match path")
  .action((robotsTxt: string, userAgent: string, path: string) => {
    try {
      const buffer = fs.readFileSync(robotsTxt);
      const result = matcher(buffer, userAgent, path);
      console.log(result ? "Allowed" : "Disallowed");
    } catch (err) {
      console.log(err instanceof Error ? err.message : err);
    }
  });

program.parse();
