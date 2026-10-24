import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <span className="inline-flex rounded-full bg-fg px-3.5 py-1.5 text-[13px] font-semibold text-white">404</span>
          <h1 className="mt-6 text-balance font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.04em] text-fg sm:text-6xl">
            Nothing built here yet
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            That page doesn&apos;t exist. Everything on this site lives on one page.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/">Back home</Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
