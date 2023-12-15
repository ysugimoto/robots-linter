export const USERAGENT = "USERAGENT";
export const COMMENT = "COMMENT";
export const SEPARATOR = "SEPARATOR";
export const ALLOW = "ALLOW";
export const DISALLOW = "DISALLOW";
export const IDENT = "IDENT"; // includes path-pattern, product-token
export const EOF = "EOF";

export type TokenType =
  | "USERAGENT"
  | "COMMENT"
  | "SEPARATOR"
  | "ALLOW"
  | "DISALLOW"
  | "IDENT"
  | "EOF";

export class Token {
  public tokenType: TokenType;
  public literal: string;
  public line: number;
  public index: number;

  constructor(t: TokenType, literal: string, line: number, index: number) {
    this.tokenType = t;
    this.literal = literal;
    this.line = line;
    this.index = index;
  }
}
