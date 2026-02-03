import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
        setCurrentParticipants((prev) => [data.participant, ...prev])
      })
    })

    return () => {
      subscription.delete()
    }
  }, [id])


  return (
    <>
      <Head title={title} />

      <div className="flex flex-col gap-6 p-4 max-w-2xl mx-auto min-h-screen pt-20">
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
              <AnimatePresence mode="popLayout">
                {currentParticipants.length === 0 ? (
                  <motion.p
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-muted-foreground text-sm"
                  >
                    No participants yet.
                  </motion.p>
                ) : (
                  currentParticipants.map((participant) => (
                    <motion.li
                      layout
                      key={participant.id}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                      className="p-3 bg-white border-2 border-border rounded-base shadow-shadow flex items-center font-base"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse" />
                      <span>{participant.name}</span>
                    </motion.li>
                  ))
                )}
              </AnimatePresence>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
