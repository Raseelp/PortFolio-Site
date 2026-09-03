"use client";

import { useState } from "react";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { TechStackFlow } from "./tech-stack/TechStackFlow";
import { TechStackViewToggle } from "./tech-stack/TechStackViewToggle";
import { BrowseTree } from "./tech-stack/browse/BrowseTree";
import type { View } from "./tech-stack/TechStackTypes";

/**
 * Two views over the same skillGroups data: Flow (the ambient scrolling
 * strip — good for personality, bad for "does this person know X" at a
 * glance) and Browse (every category from the resume's own Skill section,
 * rendered as a directory tree, all fully visible). Defaults to Flow.
 */
export function TechStack() {
  const [view, setView] = useState<View>("flow");

  return (
    <section id="stack" className="bg-bg py-20 md:py-28">
      <Container>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-deep">
              Tech stack
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-fg md:text-4xl">
              What I build with
            </h2>
          </div>
          <TechStackViewToggle view={view} onChange={setView} />
        </Reveal>
      </Container>

      {view === "flow" ? (
        <TechStackFlow />
      ) : (
        <Container>
          <BrowseTree />
        </Container>
      )}
    </section>
  );
}
