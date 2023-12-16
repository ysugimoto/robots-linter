import { UnexpectedToken, InvalidProductToken } from "./exceptions";
import { parse, decodePath } from "./parser";

describe("Parser Test", () => {
  describe("Group", () => {
    it("Single Group", () => {
      const robots = `
User-Agent: *
Allow: /foo Disallow: /bar
Allow: /foo/bar/baz$
Allow: /foo/bar # comment
`;
      const result = parse(robots);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userAgent: "*",
        rules: [
          { type: "ALLOW", path: "/foo" },
          { type: "DISALLOW", path: "/bar" },
          { type: "ALLOW", path: "/foo/bar/baz$" },
          { type: "ALLOW", path: "/foo/bar" },
        ],
      });
    });

    it("Multiple Group", () => {
      const robots = `
User-Agent: *
Allow: /foo
Disallow: /bar

User-Agent: GoogleBot
Allow: /dog
Disallow: /cat
`;
      const result = parse(robots);
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        userAgent: "*",
        rules: [
          { type: "ALLOW", path: "/foo" },
          { type: "DISALLOW", path: "/bar" },
        ],
      });
      expect(result[1]).toMatchObject({
        userAgent: "GoogleBot",
        rules: [
          { type: "ALLOW", path: "/dog" },
          { type: "DISALLOW", path: "/cat" },
        ],
      });
    });

    it("Concat path-pattern", () => {
      const robots = `
# This is a comment
User-Agent: *
Allow: /foo?query:foo=bar
`;
      const result = parse(robots);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userAgent: "*",
        rules: [{ type: "ALLOW", path: "/foo?query:foo=bar" }],
      });
    });

    it("Ignore fields", () => {
      const robots = `
User-Agent: *
Allow: /
Clawl-Delay: 10

Sitemap: https://example.com/sitemap.xml
`;
      const result = parse(robots);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userAgent: "*",
        rules: [{ type: "ALLOW", path: "/" }],
      });
    });
  });

  describe("Comment", () => {
    it("skip comments", () => {
      const robots = `
# This is a comment
User-Agent: *
Allow: /foo
Disallow: /bar
`;
      const result = parse(robots);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userAgent: "*",
        rules: [
          { type: "ALLOW", path: "/foo" },
          { type: "DISALLOW", path: "/bar" },
        ],
      });
    });
  });

  describe("Parse Errors", () => {
    it("Unexpected ident", () => {
      const robots = "Foo *";
      expect(() => parse(robots)).toThrowError(UnexpectedToken);
    });
    it("Lacking colon in User-Agent", () => {
      const robots = `
User-Agent *`;
      expect(() => parse(robots)).toThrowError(UnexpectedToken);
    });
    it("Lacking colon in Allow", () => {
      const robots = `
User-Agent: *
Allow /foo
`;
      expect(() => parse(robots)).toThrowError(UnexpectedToken);
    });
    it("Lacking colon in Disallow", () => {
      const robots = `
User-Agent: *
Disllow /foo
`;
      expect(() => parse(robots)).toThrowError(UnexpectedToken);
    });

    it("User-Agent line must only contains specific characters", () => {
      // https://datatracker.ietf.org/doc/html/rfc9309#name-the-user-agent-line
      const robots = `
User-Agent: GoogleBot+
Disllow /foo
`;
      expect(() => parse(robots)).toThrowError(InvalidProductToken);
    });
  });

  describe("Decode encoded path", () => {
    it("unicode point", () => {
      expect(decodePath("/foo/bar/U+E38384")).toBe("/foo/bar/ツ");
    });
    it("URI encoded", () => {
      expect(decodePath("/foo/bar/%62%61%7A")).toBe("/foo/bar/baz");
    });
  });
});
