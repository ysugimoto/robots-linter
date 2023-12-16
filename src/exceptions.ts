import { Token, TokenType } from "./token";

// UnexpectedCharacter represents Lexer exception,
// Unexpected characters like invisible character are found
export class UnexpectedCharacter extends Error {
  constructor(c: string, line: number, index: number) {
    super(
      `Unexpected Character "${c}" found at line ${line}, position ${index}`,
    );
  }
}

// UnexpectedToken represents parser exception - Invalid Syntax
export class UnexpectedToken extends Error {
  constructor(t: Token, expects?: TokenType) {
    super(
      [
        `Unexpected Token "${t.literal}" found`,
        expects ? ` Expects ${expects}` : "",
        ` at line ${t.line}, position ${t.index}`,
      ].join(""),
    );
  }
}
