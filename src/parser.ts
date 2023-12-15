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
import { ParseError } from "./exceptions";

export type Rule = {
  type: string;
  path: string;
};

export type RobotRule = {
  userAgent: string;
  rules: Array<Rule>;
};

export function parse(robots: string): Array<RobotRule> {
  const tokens = lexer(robots);
  const result: Array<RobotRule> = [];

  let token: Token;
  while (true) {
    token = tokens.nextToken();
    switch (token.tokenType) {
      case USERAGENT:
        const group = parseGroup(tokens);
        const exists = result.find(
          ({ userAgent }) => userAgent === group.userAgent,
        );
        if (exists) {
          exists.rules.push(...group.rules);
        } else {
          result.push(group);
        }
        break;
      case COMMENT:
        break;
      case EOF:
        return result;
      default:
        throw new ParseError(token);
    }
  }
}

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
        break;
      case ALLOW:
        rule.rules.push({ type: "ALLOW", path: parseRule(l) });
        break;
      case DISALLOW:
        rule.rules.push({ type: "DISALLOW", path: parseRule(l) });
        break;
      default:
        throw new ParseError(token);
    }
  }
  return rule;
}

function parseRule(l: Lexer): string {
  let token = nextTokenIs(l, SEPARATOR);
  token = nextTokenIs(l, IDENT);
  return token.literal;
}

function nextTokenIs(l: Lexer, expect: TokenType): Token {
  const token = l.nextToken();
  if (token.tokenType !== expect) {
    throw new ParseError(token, expect);
  }
  return token;
}
