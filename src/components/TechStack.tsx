"use client";

import { useState } from "react";
import { Container } from "./ui/Container";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
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
    <section id="stack" className="py-16 md:py-24">
      <Container>
        <SectionHeading eyebrow="Stack" lead="What I" mark="build with" sub="And what I keep reaching for." />
        <Reveal delay={0.1} className="mt-8 flex justify-start">
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
