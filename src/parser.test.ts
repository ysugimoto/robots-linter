import { parse } from "./parser";

describe("Parser Test", () => {
  describe("Group", () => {
    it("Single Group", () => {
      const robots = `
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

    it("Merged Group", () => {
      const robots = `
User-Agent: *
Allow: /foo
Disallow: /bar

User-Agent: *
Allow: /dog
Disallow: /cat
`;
      const result = parse(robots);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        userAgent: "*",
        rules: [
          { type: "ALLOW", path: "/foo" },
          { type: "DISALLOW", path: "/bar" },
          { type: "ALLOW", path: "/dog" },
          { type: "DISALLOW", path: "/cat" },
        ],
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
});
