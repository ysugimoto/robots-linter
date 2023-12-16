import { matcher } from "./matcher";

describe("matcher function", () => {
  it("basic allow and disallow", () => {
    const robotText = `
User-Agent: *
allow: /foo
disallow: /foo/bar/
disallow: /foo/baz/quz.html$

User-Agent: ExampleBot
disallow: /
`;
    expect(matcher(robotText, "GoogleBot", "/foo")).toBe(true);
    expect(matcher(robotText, "GoogleBot", "/")).toBe(true);
    expect(matcher(robotText, "GoogleBot", "/foo/bar/baz")).toBe(false);
    expect(matcher(robotText, "GoogleBot", "/foo/baz")).toBe(true);
    expect(matcher(robotText, "GoogleBot", "/foo/baz/quz.html")).toBe(false);
  });

  it("RFC example match", () => {
    const table: Array<{
      from: string;
      to: string;
    }> = [
      { from: "/foo/bar?baz=quz", to: "/foo/bar?baz=quz" },
      {
        from: "/foo/bar?baz=https://foo.bar",
        to: "/foo/bar?baz=https%3A%2F%2Ffoo.bar",
      },
      { from: "/foo/bar/U+E38384", to: "/foo/bar/%E3%83%84" },
      { from: "/foo/bar/%E3%83%84", to: "/foo/bar/%E3%83%84" },
      { from: "/foo/bar/%62%61%7A", to: "/foo/bar/%62%61%7A" },
    ];

    for (const t of table) {
      const robotText = `
User-Agent: *
disallow: ${t.from}
`;
      expect(matcher(robotText, "GoogleBot", t.to)).toBe(false);
    }
  });

  it("CLI test caser", () => {
    const robotText = `
User-Agent: *
allow: /
disallow: /foo
`;
    expect(matcher(robotText, "GoogleBot", "/foo/bar")).toBe(false);
  });
});
