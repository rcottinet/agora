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
      <div className={'m-5'}>
        <span className={'text-xl'}>New Agora</span>

        <form onSubmit={submit}>
          <label htmlFor="title" className={'block mt-2'}>Title</label>
          <input
            name='title'
            type="text"
            className={'mt-2 border p-2'}
            value={data.title}
            onChange={(e) => setData('title', e.target.value)}
          />
          {errors.title && <span className={'text-red-500'}>{errors.title}</span>}
          <button
            type="submit"
            disabled={processing}
            className={'mt-2 p-2 bg-gray-400 text-white rounded'}
          >
            Create
          </button>
        </form>
      </div>
    </>
  )
}
