import { Head, useForm, usePage } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function JoinAgora({ title }: { title: string}) {

  const url = usePage().url

  const { data, setData, post, processing, errors } = useForm({
    name: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post(url)
  }

  return (
    <>
      <Head title={`Join ${title}`} />

      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Join Agora</CardTitle>
            <CardDescription>Enter your name to join <strong>{title}</strong>.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
                {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={processing}>
                {processing ? 'Joining...' : 'Join'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
