// Constant strings represent specific identifiers
export const USERAGENT = "USERAGENT";
export const COMMENT = "COMMENT";
export const SEPARATOR = "SEPARATOR";
export const ALLOW = "ALLOW";
export const DISALLOW = "DISALLOW";
export const IDENT = "IDENT"; // includes path-pattern, product-token
export const EOF = "EOF";

// Define token types which is defined in RFC9039
// see: https://datatracker.ietf.org/doc/html/rfc9309
export type TokenType =
  | "USERAGENT"
  | "COMMENT"
  | "SEPARATOR"
  | "ALLOW"
  | "DISALLOW"
  | "IDENT"
  | "EOF";

// Token class represents Token information
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
