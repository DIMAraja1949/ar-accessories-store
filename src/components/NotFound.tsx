import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <main
      aria-labelledby="not-found-title"
      className="flex min-h-dvh items-center justify-center bg-background px-6 py-16 text-foreground"
    >
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          404
        </p>
        <h1 id="not-found-title" className="mt-3 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-muted-foreground">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <Button asChild className="mt-8">
          <Link to="/">Return to home</Link>
        </Button>
      </div>
    </main>
  )
}
