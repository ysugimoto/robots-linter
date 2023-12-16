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
  EOF,
} from "./token";
import { UnexpectedToken } from "./exceptions";

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

// expose functional parser, returns array of group rulesets
export function parse(robots: string): Array<RobotRule> {
  const l = lexer(robots);
  const result: Array<RobotRule> = [];

  let token: Token;

  while (true) {
    token = l.nextToken();
    switch (token.tokenType) {
      case USERAGENT:
        result.push(parseGroup(l));
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

// parseGroup() parses group specification.
// group means the set of User-Agent and allow/disallow rules
function parseGroup(l: Lexer): RobotRule {
  const rule: RobotRule = {
    userAgent: "",
    rules: [],
  };
  let token: Token = nextTokenIs(l, SEPARATOR);
  token = nextTokenIs(l, IDENT);
  rule.userAgent = token.literal;

  while (true) {
    token = l.peekToken();
    if (token.tokenType === EOF || token.tokenType === USERAGENT) {
      break;
    }
    token = l.nextToken();
    switch (token.tokenType) {
      case COMMENT:
        // Skip comment
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
      patterns.push(token.literal);
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
