import { UnexpectedToken } from "./exceptions";
import { parse } from "./parser";

describe("Parser Test", () => {
  describe("Group", () => {
    it("Single Group", () => {
      const robots = `
User-Agent: *
Allow: /foo
Disallow: /bar
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
  });
});
