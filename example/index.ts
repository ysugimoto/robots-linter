import { parse } from "robots-text-parser";

const robotsText = `
User-Agent: *
Allow: /path/to/resource
Disallow: /path/to/forbidden

# Hey, this is an example comment in robots.txt!
# Our parser should parse correctly.

User-Agent: GoogleBot
Disallow: /
`;

function main() {
  const result = parse(robotsText);
  console.log(result);
}

main();
