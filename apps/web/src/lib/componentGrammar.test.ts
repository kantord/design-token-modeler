import { describe, expect, it } from "vitest";
import { GrammarSchema, defaultGrammar, enumerateAddresses, issuesAt } from "./componentGrammar";

describe("GrammarSchema", () => {
  it("accepts the default grammar", () => {
    const result = GrammarSchema.safeParse(defaultGrammar());
    expect(result.success).toBe(true);
  });

  it("rejects a root that isn't a defined surface", () => {
    const grammar = { ...defaultGrammar(), root: "nope" };
    const result = GrammarSchema.safeParse(grammar);
    expect(result.success).toBe(false);
    expect(issuesAt(result.success ? [] : result.error.issues, ["root"])).toEqual([
      `"nope" is not a defined surface`,
    ]);
  });

  it("rejects a surface's `contains` entry that isn't a defined surface", () => {
    const grammar = defaultGrammar();
    grammar.surfaces[0]!.contains.push("ghost");
    const result = GrammarSchema.safeParse(grammar);
    expect(result.success).toBe(false);
    const path = ["surfaces", 0, "contains", grammar.surfaces[0]!.contains.length - 1];
    expect(issuesAt(result.success ? [] : result.error.issues, path)).toEqual([`"ghost" is not a defined surface`]);
  });

  it("rejects a surface's `leaves` entry that isn't a defined leaf", () => {
    const grammar = defaultGrammar();
    grammar.surfaces[0]!.leaves.push("ghost");
    const result = GrammarSchema.safeParse(grammar);
    expect(result.success).toBe(false);
  });

  it("rejects duplicate surface ids", () => {
    const grammar = defaultGrammar();
    grammar.surfaces.push({ ...grammar.surfaces[0]! });
    const result = GrammarSchema.safeParse(grammar);
    expect(result.success).toBe(false);
  });

  it("requires at least one state on an interactive surface", () => {
    const grammar = defaultGrammar();
    const button = grammar.surfaces.find((s) => s.id === "button");
    expect(button?.kind).toBe("interactive");
    if (button?.kind === "interactive") button.states = [];
    const result = GrammarSchema.safeParse(grammar);
    expect(result.success).toBe(false);
  });

  it("allows a static surface to omit states entirely", () => {
    const grammar = defaultGrammar();
    const card = grammar.surfaces.find((s) => s.id === "card");
    expect(card?.kind).toBe("static");
    expect("states" in (card ?? {})).toBe(false);
    const result = GrammarSchema.safeParse(grammar);
    expect(result.success).toBe(true);
  });
});

describe("enumerateAddresses", () => {
  it("walks the default grammar's containment tree into addresses", () => {
    const addresses = enumerateAddresses(defaultGrammar());
    expect(addresses).toContain("background");
    expect(addresses).toContain("background/text");
    expect(addresses).toContain("background/card");
    expect(addresses).toContain("background/card/button");
    expect(addresses).toContain("background/card/button/text");
    expect(addresses).toContain("background/card/button/icon");
    // Reused: button is reachable both directly and nested under card.
    expect(addresses).toContain("background/button");
    expect(addresses).toContain("background/button/text");
  });

  it("is bounded by maxDepth so a self-containing surface can't loop forever", () => {
    const grammar = defaultGrammar();
    grammar.maxDepth = 3;
    grammar.surfaces.find((s) => s.id === "card")!.contains.push("card");
    const addresses = enumerateAddresses(grammar);
    expect(addresses.length).toBeLessThan(1000);
  });
});
