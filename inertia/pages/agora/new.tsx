import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'

export default function NewAgora() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/')
  }

  return (
    <>
      <Head title="New Agora" />
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-xl border shadow-sm">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight">New Agora</h1>
            <p className="text-muted-foreground">Create a new session to share with your audience.</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Math Class - Oct 24"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                required
              />
              {errors.title && <p className="text-sm font-medium text-destructive">{errors.title}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={processing}>
              {processing ? 'Creating...' : 'Create Agora'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
