import { Head, Link } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SuccessAgora() {
  return (
    <>
      <Head title="Success Agora" />

      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Success!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-base">You have successfully joined the Agora.</p>
            <Button asChild className="w-full">
                <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
