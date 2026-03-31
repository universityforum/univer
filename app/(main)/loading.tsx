import { Spinner } from '@/components/ui/spinner'

export default function MainLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">Loading content...</p>
      </div>
    </div>
  )
}
