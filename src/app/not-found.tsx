import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center bg-bg">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-deep">404</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-fg sm:text-5xl">
            Nothing built here yet
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
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
