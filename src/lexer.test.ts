import { lexer } from "./lexer";

describe("Lex UserAgent", () => {
  it("wildcard", () => {
    const l = lexer("User-Agent: *");
    expect(l.nextToken()).toMatchObject({
      tokenType: "USERAGENT",
      literal: "User-Agent",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 11,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "*",
      line: 1,
      index: 13,
    });
  });

  it("Bot", () => {
    const l = lexer("User-Agent: GoogleBot");
    expect(l.nextToken()).toMatchObject({
      tokenType: "USERAGENT",
      literal: "User-Agent",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 11,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "GoogleBot",
      line: 1,
      index: 13,
    });
  });

  it("Browser", () => {
    const ua =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const l = lexer(`User-Agent: ${ua}`);
    expect(l.nextToken()).toMatchObject({
      tokenType: "USERAGENT",
      literal: "User-Agent",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 11,
    });

    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: ua,
      line: 1,
      index: 13,
    });
  });
});

describe("Lex Rule", () => {
  it("allow path", () => {
    const l = lexer("allow: /");
    expect(l.nextToken()).toMatchObject({
      tokenType: "ALLOW",
      literal: "allow",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 6,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "/",
      line: 1,
      index: 8,
    });
  });

  it("allow path (case-insensitive)", () => {
    const l = lexer("Allow: /");
    expect(l.nextToken()).toMatchObject({
      tokenType: "ALLOW",
      literal: "Allow",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 6,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "/",
      line: 1,
      index: 8,
    });
  });

  it("allow path with query", () => {
    const l = lexer("allow: /?foo=bar");
    expect(l.nextToken()).toMatchObject({
      tokenType: "ALLOW",
      literal: "allow",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 6,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "/?foo=bar",
      line: 1,
      index: 8,
    });
  });

  it("disallow path", () => {
    const l = lexer("disallow: /");
    expect(l.nextToken()).toMatchObject({
      tokenType: "DISALLOW",
      literal: "disallow",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 9,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "/",
      line: 1,
      index: 11,
    });
  });

  it("disallow path (case-insensitive)", () => {
    const l = lexer("Disallow: /");
    expect(l.nextToken()).toMatchObject({
      tokenType: "DISALLOW",
      literal: "Disallow",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 9,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "/",
      line: 1,
      index: 11,
    });
  });

  it("disallow path with query", () => {
    const l = lexer("disallow: /?foo=bar");
    expect(l.nextToken()).toMatchObject({
      tokenType: "DISALLOW",
      literal: "disallow",
      line: 1,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 1,
      index: 9,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "/?foo=bar",
      line: 1,
      index: 11,
    });
  });
});

describe("Lex comments", () => {
  it("prefix comments", () => {
    const l = lexer(`
# This is a comment
User-Agent: *
`);
    expect(l.nextToken()).toMatchObject({
      tokenType: "COMMENT",
      literal: "# This is a comment",
      line: 2,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "USERAGENT",
      literal: "User-Agent",
      line: 3,
      index: 1,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "SEPARATOR",
      literal: ":",
      line: 3,
      index: 11,
    });
    expect(l.nextToken()).toMatchObject({
      tokenType: "IDENT",
      literal: "*",
      line: 3,
      index: 13,
    });
  });
});
