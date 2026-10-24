import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { TechStack } from "@/components/TechStack";
import { Experience } from "@/components/Experience";
import { SelectedWorks } from "@/components/SelectedWorks";
import { Education } from "@/components/Education";
import { Contact } from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <About />
        <TechStack />
        <Experience />
        <SelectedWorks />
        <Education />
        <Contact />
      </main>
    </>
  );
}
