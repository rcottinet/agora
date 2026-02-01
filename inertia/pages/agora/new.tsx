import { Head, useForm } from '@inertiajs/react'

export default function NewAgora() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
  })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post('/')
  }

  return (
    <>
      <Head title="NewAgora" />
      <div>
        <span className={'text-xl'}>New Agora</span>

        <form onSubmit={submit}>
          <input
            type="text"
            className={'mt-2 border p-2'}
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
          />
          {errors.title && <div>{errors.title}</div>}
          <button type="submit" disabled={processing} className={'mt-2 p-2 bg-blue-500 text-white'}>
            Create
          </button>
        </form>
      </div>
    </>
  )
}
