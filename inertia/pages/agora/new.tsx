import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create a new Agora</CardTitle>
            <CardDescription>Start a new session for your class or meeting.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. Math Class - Oct 24"
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
          </CardContent>
        </Card>
      </div>
    </>
  )
}
