import { Head, useForm, usePage } from '@inertiajs/react'

export default function JoinAgora({ title }: { title: string}) {

  const url = usePage().url

  const { data, setData, post, processing, errors } = useForm({
    name: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post(url)
  }

  return (
    <>
      <Head title="JoinAgora" />

      <div>
        <span className={'text-sm block mt-2'}>Join {title}</span>

        <form onSubmit={submit}>
          <input
            type="text"
            className={'mt-2 border p-2'}
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
          />
          {errors.name && <div className={'text-red-500'}>{errors.name}</div>}
          <button type="submit" disabled={processing} className={'mt-2 p-2 bg-blue-500 text-white'}>
            Join
          </button>
        </form>
      </div>
    </>
  )
}
