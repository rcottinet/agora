import { Head, useForm } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Anchor, Waves } from 'lucide-react'

export default function NewGame() {
  const { data, setData, post, processing } = useForm({ name: '' })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/play')
  }

  return (
    <>
      <Head title="Bataille Navale" />
      <div className="relative flex min-h-screen items-center justify-center p-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(0deg,transparent,transparent_6px,#000_6px,#000_7px)]" />

        <Card className="w-full max-w-md z-10 relative bg-secondary-background">
          <CardHeader>
            <div className="relative w-fit mx-auto mb-2">
              <div className="relative z-10 bg-main px-5 py-3 border-2 border-black rounded-base shadow-shadow flex items-center gap-2">
                <Anchor className="h-6 w-6" />
                <h1 className="text-2xl font-heading uppercase tracking-tight">Bataille Navale</h1>
              </div>
            </div>
            <p className="text-center text-sm font-mono uppercase tracking-widest text-foreground/60">
              1 vs 1 · en temps réel
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ton nom d'amiral</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  maxLength={40}
                  placeholder="Amiral Nelson"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={processing}>
                <Waves className="h-4 w-4" />
                {processing ? 'Création...' : 'Créer une partie'}
              </Button>

              <p className="text-center text-xs text-foreground/60">
                Partage le lien généré pour inviter un adversaire.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
