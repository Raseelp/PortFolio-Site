import { Reveal } from "../ui/Reveal";
import { TechChip } from "../ui/TechChip";
import { skillGroups } from "@/lib/content";

// Flatten every skill into one deduplicated marquee row, mirroring the
// reference site's single continuously-scrolling "My Dev Stack" strip.
const ALL_SKILLS = Array.from(new Set(skillGroups.flatMap((g) => g.items)));

/** The ambient, personality-forward view — a continuous scrolling strip. */
export function TechStackFlow() {
  return (
    <Reveal delay={0.1} className="mt-14">
      <div
        className="overflow-hidden py-2"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="marquee-track flex w-max items-center gap-2">
          {[...ALL_SKILLS, ...ALL_SKILLS].map((item, i) => (
            <TechChip key={`${item}-${i}`} label={item} size="lg" />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
