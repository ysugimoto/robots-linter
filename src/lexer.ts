import {
  USERAGENT,
  SEPARATOR,
  COMMENT,
  ALLOW,
  DISALLOW,
  IDENT,
  EOF,
  Token,
} from "./token";
import { UnexpectedToken } from "./exceptions";

export function lexer(input: string): Lexer {
  return new Lexer(Buffer.from(input));
}

export class Lexer {
  private input: Buffer;
  private stack: Array<string> = [];
  private buffer: Array<number>;
  private peeks: Array<Token> = [];

  private isEOF = false;
  private current = 0;
  private pointer = -1;
  private line = 1;
  private index = 0;

  constructor(input: Buffer) {
    this.input = input;
    this.buffer = [];

    this.read();
  }

  private read() {
    const c = this.input[++this.pointer];
    if (c === undefined) {
      this.current = 0x00;
      this.index++;
      return;
    }
    if (this.current === 0x0a) {
      this.newLine();
    }
    this.index++;
    this.current = c;
    this.buffer.push(c);
  }

  private peek(): number {
    if (this.pointer >= this.input.byteLength - 1) {
      return 0x00; // EOF
    }
    return this.input[this.pointer + 1];
  }

  private newLine() {
    this.stack.push(String.fromCodePoint(...this.buffer));
    this.buffer = [];
    this.index = 0;
    this.line++;
  }

  public peekToken(): Token {
    const tok = this.nextToken();
    this.peeks.push(tok);
    return tok;
  }

  public nextToken(): Token {
    if (this.isEOF) {
      return new Token(EOF, "", this.line, this.index);
    }

    if (this.peeks.length > 0) {
      const peek = this.peeks.shift();
      if (!peek) {
        throw new Error("Undefined peek");
      }
      return peek;
    }

    this.skipWhitespace();

    if (this.pointer > this.input.byteLength - 1) {
      this.isEOF = true;
      return new Token(EOF, "", this.line, this.index);
    }

    let t: Token;
    const line = this.line;
    const index = this.index;

    switch (this.current) {
      case 0x3a: // ":" - separator
        t = new Token(SEPARATOR, ":", line, index);
        break;
      case 0x23: // "#" - comments
        t = new Token(
          COMMENT,
          String.fromCodePoint(...this.readEOL()),
          line,
          index,
        );
        break;
      default:
        if (this.isCharacter(this.current)) {
          const literal = this.readIdentifier();
          const ident = String.fromCodePoint(...literal);

          // Identity is case-insensitive
          switch (ident.toLowerCase()) {
            case "user-agent": // startgroupline
              t = new Token(USERAGENT, ident, line, index);
              break;
            case "allow": // Allow rule
              t = new Token(ALLOW, ident, line, index);
              break;
            case "disallow": // Disallow rule
              t = new Token(DISALLOW, ident, line, index);
              break;
            default: // default as product-token or path-pattern
              this.read();
              t = new Token(
                IDENT,
                ident + String.fromCodePoint(...this.readEOL()),
                line,
                index,
              );
              break;
          }
        } else {
          throw new UnexpectedToken(
            String.fromCharCode(this.current),
            line,
            index,
          );
        }
    }
    this.read();
    return t;
  }

  private skipWhitespace() {
    while (true) {
      if (
        this.current === 0x20 ||
        this.current === 0x09 ||
        this.current === 0x0d ||
        this.current === 0x0a
      ) {
        this.read();
        continue;
      }
      break;
    }
  }

  private isCharacter(code: number) {
    return code >= 0x20 && code <= 0x7e && code !== 0x3a;
  }

  private readIdentifier(): Array<number> {
    const codes: Array<number> = [this.current];
    while (true) {
      if (!this.isCharacter(this.peek())) {
        return codes;
      }
      this.read();
      codes.push(this.current);
    }
  }

  private readEOL(): Array<number> {
    const codes: Array<number> = [];
    if (this.current === 0x00 || this.current === 0x0a) {
      return codes;
    }
    codes.push(this.current);
    while (true) {
      const peek = this.peek();
      if (peek === 0x00 || peek === 0x0a) {
        return codes;
      }
      this.read();
      codes.push(this.current);
    }
  }
}
