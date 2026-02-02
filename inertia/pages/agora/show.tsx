import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { transmit } from '~/transmit'

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
      <Head title="ShowAgora" />

      <div className={'m-5 border p-5 rounded-lg'}>
        <span className={'text-xl'}>{title}</span>
        <span className={'text-sm block mt-2'}>Invite URL: {inviteUrl}</span>
      </div>
      <div className={'m-5 border p-5 rounded-lg'}>
        <span className={'text-xl'}>Participants - ({currentParticipants.length})</span>
        <ul className={'list-disc list-inside mt-2'}>
          {currentParticipants.length === 0 ? (
            <span>No participants yet.</span>
          ) : (
            currentParticipants.map((participant, index) => (
              <li key={index}>
                {participant.name}
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  )
}
