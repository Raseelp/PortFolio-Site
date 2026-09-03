import type { Achievement } from "@/lib/content";
import type { TechIconSlug } from "@/lib/techIcons";

/**
 * Normalizes both experience shapes (an entry with subEntries, or a plain
 * entry with its own achievements) into one list every achievement-display
 * variant can render the same way.
 */
export interface AchievementGroup {
  name?: string;
  tech?: TechIconSlug[];
  achievements: Achievement[];
  links?: { playStore?: string; appStore?: string };
}
