import {
  USERAGENT,
  SEPARATOR,
  COMMENT,
  ALLOW,
  DISALLOW,
  IDENT,
  DIGIT,
  CLAWLDELAY,
  SITEMAP,
  EOF,
  Token,
} from "./token";
import { UnexpectedCharacter } from "./exceptions";

// lexer() is functional syntax that creates lexer instance.
// The first argument accepts string or Uint8Array,
// and always treat as Uint8Array inside in order to support browser runtime.
export function lexer(input: string | Uint8Array): Lexer {
  return new Lexer(
    typeof input === "string" ? new TextEncoder().encode(input) : input,
  );
}

// Lexer class represents lex states in the private field.
// advance reading characters by calling nextToken() method.
export class Lexer {
  // input represents input buffer.
  // In lexing, we always treat characters as UTF-8 codepoint
  private input: Uint8Array;
  // Leading stack - indicates buffers for each lines
  private stack: Array<string> = [];
  // Current reading buffer characters
  private buffer: Array<number>;
  // Peek token stack, stored in this array when peekToken() is called.
  private peeks: Array<Token> = [];

  // Flag of input reached to EOF
  private isEOF = false;
  // Current character (UTF-8 code point)
  private current = 0;
  // Buffer index pointer
  private pointer = -1;
  // Current line number
  private line = 1;
  // Current reading position in the line
  private index = 0;

  // Constructor: initialize states
  constructor(input: Uint8Array) {
    this.input = input;
    this.buffer = [];

    this.read();
  }

  // read() reads next character
  private read() {
    const c = this.input[++this.pointer];
    // Guard process: if pointer is out of bounds of input, probably c is undefined.
    if (c === undefined) {
      this.current = 0x00;
      this.index++;
      return;
    }
    // Found LF code, store and reset line and index status.
    if (this.current === 0x0a) {
      this.newLine();
    }

    this.index++;
    this.current = c;
    this.buffer.push(c);
  }

  // read more next character
  private peek(): number {
    if (this.pointer >= this.input.byteLength - 1) {
      return 0x00; // EOF
    }
    return this.input[this.pointer + 1];
  }

  // reset line and index status
  private newLine() {
    this.stack.push(String.fromCodePoint(...this.buffer));
    this.buffer = [];
    this.index = 0;
    this.line++;
  }

  // read peek token
  public peekToken(): Token {
    const tok = this.nextToken();
    this.peeks.push(tok);
    return tok;
  }

  // read next token
  public nextToken(): Token {
    // If lexer already reached to EOF, always returns EOF token
    if (this.isEOF) {
      return new Token(EOF, "", this.line, this.index);
    }

    // When peek characters are stores, pop it
    if (this.peeks.length > 0) {
      const peek = this.peeks.shift();
      if (!peek) {
        throw new Error("Undefined peek"); // maybe unreachable
      }
      return peek;
    }

    // Skip whitespace-related characters
    this.skipWhitespace();

    // Check input reaches to EOF
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
        if (this.isDigit(this.current)) {
          t = new Token(
            DIGIT,
            String.fromCodePoint(...this.readDigit()),
            line,
            index,
          );
        } else if (this.isCharacter(this.current)) {
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
            case "clawl-delay":
              t = new Token(CLAWLDELAY, ident, line, index);
              break;
            case "sitemap":
              t = new Token(SITEMAP, ident, line, index);
              break;
            default: // default as product-token or path-pattern
              t = new Token(IDENT, ident, line, index);
              break;
          }
        } else {
          throw new UnexpectedCharacter(
            String.fromCharCode(this.current),
            line,
            index,
          );
        }
    }
    this.read();
    return t;
  }

  // Skip whitespace-related characters.
  // Lexer skips WHITESPACE(0x20), HORIZONTAL_TAB(0x09), CARRIGE_RETURN(0x0d) and LINE_FEED(0x0a)
  private skipWhitespace() {
    while (true) {
      if (
        this.current === 0x20 || // WHITESPACE
        this.current === 0x09 || // HORIZONTAL_TAB
        this.current === 0x0d || // CARRIGE_RETURN
        this.current === 0x0a // LINE_FEED
      ) {
        this.read();
        continue;
      }
      break;
    }
  }

  // Check curent code point indicates character code.
  // Lexer treats character as:
  // 0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"$%'()*+,-./:;<=>?@[\]^_`{|}~
  private isCharacter(code: number) {
    return code >= 0x21 && code <= 0x7e && code !== 0x3a && code !== 0x23;
  }

  // Check current code point incicated digit code.
  private isDigit(code: number) {
    return code >= 0x30 && code <= 0x39;
  }

  // Read identifiler characters
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

  // Read decimal characters
  private readDigit(): Array<number> {
    const codes: Array<number> = [this.current];
    while (true) {
      if (!this.isDigit(this.peek())) {
        return codes;
      }
      this.read();
      codes.push(this.current);
    }
  }

  // Read characters until LF is found
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
