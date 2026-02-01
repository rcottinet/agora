import { Head } from '@inertiajs/react'

export default function NotFoundAgora({ title }: { title: string }) {
  return (
    <>
      <Head title="ShowAgora" />

      <div className={'m-5 border p-5 rounded-lg'}>
        <span className={'text-xl'}>{title}</span>
        <span className={'text-sm block mt-2'}>Not found</span>
        <span className={'text-sm block mt-2'}>Maybe you should create it?</span>
        <a href="/new" className={'text-blue-500'}>Create Agora</a>
      </div>
    </>
  )
}
