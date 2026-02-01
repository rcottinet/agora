import { Head } from '@inertiajs/react'

export default function ShowAgora({ title, inviteUrl}: { title: string, inviteUrl: string }) {
  return (
    <>
      <Head title="ShowAgora" />

      <div className={'m-5 border p-5 rounded-lg'}>
        <span className={'text-xl'}>{title}</span>
        <span className={'text-sm block mt-2'}>Invite URL: {inviteUrl}</span>
      </div>
    </>
  )
}
