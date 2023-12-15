import { Token, TokenType } from "./token";

export class UnexpectedToken extends Error {
  constructor(c: string, line: number, index: number) {
    super(`Unexpected Token "${c}" found at line ${line}, position ${index}`);
  }
}

export class ParseError extends Error {
  constructor(t: Token, expects?: TokenType) {
    super(
      [
        `Parse Error: Unexpected "${t.literal}" found`,
        expects ? ` Expects ${expects}` : "",
        ` at line ${t.line}, position ${t.index}`,
      ].join(""),
    );
  }
}
