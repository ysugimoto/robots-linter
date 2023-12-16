import { decodePath, parse, RobotRule, Rule } from "./parser";

// Expose matcher function that parse robots.txt and comparing userAgent and path.
export function matcher(
  robotsTxt: string | Buffer,
  userAgent: string,
  path: string,
): boolean {
  const robotRules = parse(robotsTxt);
  const ua = userAgent.toLowerCase();

  // Find rules by containing string in provided user-agent
  const matches = robotRules.filter((rr: RobotRule) =>
    ua.includes(rr.userAgent.toLowerCase()),
  );

  // If user-agent based matching could not found, use default group of "*"
  if (matches.length === 0) {
    const star = robotRules.find((rr: RobotRule) => rr.userAgent === "*");
    if (!star) {
      return true; // ALLOW
    }
    matches.push(star);
  }

  // Factory rules
  const rules: Array<Rule> = [];
  for (const rr of matches) {
    rules.push(...rr.rules);
  }

  return matchRules(path, rules);
}

// Try to match grouped rules which corresponds to User-Agent
function matchRules(path: string, rules: Array<Rule>): boolean {
  // Particularly, self path of /robots.txt MUST be allowed internally
  if (path === "/robots.txt") {
    return true; // ALLOW
  }
  const decoded = decodePath(path);
  const matches: Array<Rule> = [];
  for (const rule of rules) {
    const regex = toRegExpPath(rule.path);
    if (regex.test(decoded)) {
      matches.push(rule);
    }
  }

  // If any rules did not match, allow it
  if (matches.length === 0) {
    return true; // ALLOW
  }

  // Sort by the longest octet
  const sorted = matches.sort((a: Rule, b: Rule) => {
    const al = a.path.split("/").length;
    const bl = b.path.split("/").length;

    if (al === bl) {
      return a.path.length > b.path.length ? -1 : 1;
    }
    return al > bl ? -1 : 1;
  });
  return sorted[0].type === "ALLOW";
}

// Transform from path rule string to RegExp instance
function toRegExpPath(path: string): RegExp {
  const target = path
    .replace(/\?/g, "\\?")
    .split("/")
    .map((segment: string) => (segment === "*" ? ".*" : segment))
    .join("/");
  const suffix = target.slice(-1) === "/" ? ".*" : "";
  return new RegExp(`^${target}${suffix}`);
}
