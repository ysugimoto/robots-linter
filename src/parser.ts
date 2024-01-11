import { lexer, Lexer } from "./lexer";
import {
  Token,
  TokenType,
  USERAGENT,
  COMMENT,
  ALLOW,
  DISALLOW,
  IDENT,
  SEPARATOR,
  SITEMAP,
  DIGIT,
  CLAWLDELAY,
  EOF,
} from "./token";
import { InvalidProductToken, UnexpectedToken } from "./exceptions";

// Rule represents allow or disallow rule line
export type Rule = {
  type: string;
  path: string;
};

// RobotRule represents group specification for the User-Agent
export type RobotRule = {
  userAgent: string;
  rules: Array<Rule>;
};

// expose parser function, returns array of group rulesets
export function parse(robots: string | Uint8Array): Array<RobotRule> {
  const l = lexer(robots);
  const result: Array<RobotRule> = [];

  let token: Token;

  while (true) {
    token = l.nextToken();
    switch (token.tokenType) {
      case USERAGENT:
        result.push(parseGroup(l));
        break;
      case SITEMAP:
        // These line is enable but ignored by GoogleBot
        skipLine(l);
        break;
      case COMMENT:
        // Skip comment token
        break;
      case EOF:
        // End parsing
        return result;
      default:
        throw new UnexpectedToken(token);
    }
  }
}

// Skip sitemap line group
function skipLine(l: Lexer) {
  let token = nextTokenIs(l, SEPARATOR);
  while (true) {
    token = l.peekToken();
    if (token.tokenType === EOF) {
      return;
    }
    if (
      token.tokenType !== IDENT &&
      token.tokenType !== SEPARATOR &&
      token.tokenType !== COMMENT &&
      token.tokenType !== DIGIT
    ) {
      return;
    }
    l.nextToken();
  }
}

// parseGroup() parses group specification.
// group means the set of User-Agent and allow/disallow rules
function parseGroup(l: Lexer): RobotRule {
  const rule: RobotRule = {
    userAgent: "",
    rules: [],
  };
  let token: Token = nextTokenIs(l, SEPARATOR);
  token = nextTokenIs(l, IDENT);
  // Product token must be contracted with [a-zA-Z_-]+ characters
  // see https://datatracker.ietf.org/doc/html/rfc9309#name-the-user-agent-line
  if (token.literal !== "*" && !/^[a-zA-Z_-]+$/.test(token.literal)) {
    throw new InvalidProductToken(token);
  }
  rule.userAgent = token.literal;

  while (true) {
    token = l.peekToken();
    if (
      token.tokenType === EOF ||
      token.tokenType === USERAGENT ||
      token.tokenType === SITEMAP
    ) {
      break;
    }
    token = l.nextToken();
    switch (token.tokenType) {
      case COMMENT:
        // Skip comment
        break;
      case CLAWLDELAY:
        // These line is enable but ignored by GoogleBot
        nextTokenIs(l, SEPARATOR);
        nextTokenIs(l, DIGIT);
        break;
      case ALLOW:
        rule.rules.push({ type: "ALLOW", path: parseRule(l) });
        break;
      case DISALLOW:
        rule.rules.push({ type: "DISALLOW", path: parseRule(l) });
        break;
      default:
        throw new UnexpectedToken(token);
    }
  }
  return rule;
}

// parseRule() parses rule line.
// rule means the line of "[allow|disallow]: path-pattern"
function parseRule(l: Lexer): string {
  let token = nextTokenIs(l, SEPARATOR);
  const patterns: Array<string> = [];
  while (true) {
    token = l.peekToken();
    if (
      token.tokenType !== IDENT &&
      token.tokenType !== SEPARATOR &&
      token.tokenType !== COMMENT
    ) {
      break;
    }
    token = l.nextToken();
    // Skip trailing comments
    if (token.tokenType !== COMMENT) {
      patterns.push(decodePath(token.literal));
    }
  }
  return patterns.join("");
}

// Check next token is expected one
function nextTokenIs(l: Lexer, expect: TokenType): Token {
  const token = l.nextToken();
  if (token.tokenType !== expect) {
    throw new UnexpectedToken(token, expect);
  }
  return token;
}

// Decode defined paths
// https://datatracker.ietf.org/doc/html/rfc9309#section-2.2.2
export function decodePath(literal: string): string {
  return decodeURIComponent(
    literal.replace(/[uU]\+([a-zA-Z0-9]{6})/g, (_, m) => {
      return [
        `%${m.slice(0, 2)}`,
        `%${m.slice(2, 4)}`,
        `%${m.slice(4, 6)}`,
      ].join("");
    }),
  );
}
