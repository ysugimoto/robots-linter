# robots-linter

`robots-linter` implements parser and matcher `robots.txt` which is specified at [RFC 9309](https://datatracker.ietf.org/doc/html/rfc9309).

## Motivation

We could find some kind of robots.txt matcher, but could not find syntax checker so we implemented it with AST-based approach.
This is useful for syntax checking on writing robots.txt usually.

## Install and Usage

Install command from npm registry:

```shell
npm install -g robots-linter
yarn add --global robots-linter
pnpm install -g robots-linter
```

And you can use `robots-linter` cli command to execute, see help output:

```
Usage: robots-linter [options] [command]

lint and match robots.txt

Options:
  -V, --version                           output the version number
  -h, --help                              display help for command

Commands:
  lint <robots.txt>                       lint robots.txt
  match <robots.txt> <user-agent> <path>  robots.txt parser and matcher
  help [command]                          display help for command
```

## Programmable

This package also can use programmable:

```ts
import { parse, matcher } from "robots-linter";
import fs from "node:fs";

const buffer = fs.readFileSync("/path/to/robots.txt");

// Parse and lint example
try {
    parse(buffer);
} catch (err) {
    console.error(err);
}

// Matcher example
try {
    matcher(buffer, "GoogleBot", "/foo/bar");
} catch (err) {
    console.error(err);
}
```

## Contribution

- Fork this repository
- Customize / Fix problem
- Send PR :-)
- Or feel free to create issues for us. We'll look into it

## Author

Yoshiaki Sugimoto <sugimoto@wnotes.net>

## License

MIT


