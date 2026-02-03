import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
          </CardContent>
        </Card>
      </div>
    </>
  )
}
