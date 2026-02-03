import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { transmit } from '~/transmit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Participant = {
  id: string;
  name: string;
  joinedAt: string;
}

export default function ShowAgora({ id, title, inviteUrl, participants}: { id: string, title: string, inviteUrl: string, participants: Participant[] }) {
  const [currentParticipants, setCurrentParticipants] = useState<Participant[]>([...participants])

  useEffect(() => {
    const subscription = transmit.subscription(`${id}/participants`)
    subscription.create().then(() => {
      subscription.onMessage((data: {participant : {id: string, name: string, joinedAt: string}}) => {
        setCurrentParticipants((prev) => [...prev, data.participant])
      })
    })

    return () => {
      subscription.delete()
    }
  }, [id])


  return (
    <>
      <Head title={title} />

      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto min-h-screen justify-center">
        <Card>
          <CardHeader>
             <CardTitle>{title}</CardTitle>
             <CardDescription>Share this URL to invite others</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-secondary/10 rounded-base border-2 border-dashed border-border text-sm font-mono break-all font-base">
                {inviteUrl}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participants ({currentParticipants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {currentParticipants.length === 0 ? (
                <p className="text-muted-foreground text-sm">No participants yet.</p>
              ) : (
                currentParticipants.map((participant, index) => (
                  <li key={index} className="p-3 bg-white border-2 border-border rounded-base shadow-shadow flex items-center font-base">
                    <span>{participant.name}</span>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
