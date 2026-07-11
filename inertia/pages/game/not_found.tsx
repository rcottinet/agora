import { Head, Link } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Ship } from 'lucide-react'

export default function GameNotFound({ reason }: { reason?: 'full' }) {
  const full = reason === 'full'

  return (
    <>
      <Head title="Partie introuvable" />
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md bg-secondary-background text-center">
          <CardHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-base border-2 border-black bg-main shadow-shadow">
              <Ship className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-heading uppercase">
              {full ? 'Partie complète' : 'Partie introuvable'}
            </h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-foreground/70">
              {full
                ? 'Cette bataille compte déjà deux amiraux. Lance ta propre partie !'
                : "Ce lien n'est plus valide ou la partie a coulé dans les abysses."}
            </p>
            <Button asChild className="w-full">
              <Link href="/play">Nouvelle partie</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
