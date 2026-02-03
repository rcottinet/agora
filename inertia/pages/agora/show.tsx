import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { transmit } from '~/transmit'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import QRCode from 'react-qrcode-logo'
import { Button } from '@/components/ui/button'
import { Check, ClipboardCopy } from 'lucide-react'

type Participant = {
  id: string;
  name: string;
  joinedAt: string;
}

export default function ShowAgora({ id, title, inviteUrl, participants}: { id: string, title: string, inviteUrl: string, participants: Participant[] }) {
  const [currentParticipants, setCurrentParticipants] = useState<Participant[]>([...participants])
  const [hasCopied, setHasCopied] = useState(false)

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


  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl)
    setHasCopied(true)
    setTimeout(() => setHasCopied(false), 2000)
  }

  return (
    <>
      <Head title={title} />

      <div className="flex flex-col md:flex-row gap-6 p-4 max-w-2xl md:max-w-5xl mx-auto min-h-screen pt-20 md:items-start">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>Share this URL to invite others</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-4">
              <QRCode
                size={200}
                value={inviteUrl} />
            </div>
            <div className="p-3 flex items-center justify-between gap-2 bg-secondary/10 rounded-base border-2 border-dashed border-border text-sm font-mono break-all font-base">
              {inviteUrl}
              <Button size="icon" variant="neutral" onClick={copyToClipboard}>
                {hasCopied ? <Check /> : <ClipboardCopy />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
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
                      transition={{ duration: 0.3, type: 'spring', bounce: 0.3 }}
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
