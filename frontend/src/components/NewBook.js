import { useState } from 'react'
import { ADD_BOOK, ALL_BOOKS, All_AUTHORS } from '../queries'
import { useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const [ addBook ] = useMutation(ADD_BOOK, {
    refetchQueries: [ { query: ALL_BOOKS }, { query: All_AUTHORS } ],
    onError: (error) => {
      console.log('error', error.graphQLErrors)
      error.graphQLErrors.map(error => enqueueSnackbar(error.message, { variant: 'error' }))
    },
    onCompleted: (response) => {
      const bookTitle = response.addBook.title
      enqueueSnackbar(`${bookTitle} Added`, { variant: 'success' })
    }
  })

  if (!props.show) {
    return null
  }

  const validateField = (field, message) => {
    if ((typeof field == 'object' && field.length === 0) || !field) {
      enqueueSnackbar(message, { variant: 'error' });
      return false
    } else {
      return true
    }
  }

  const submit = async (event) => {
    event.preventDefault()

    if(
      !validateField(title, 'Title is a required field') ||
      !validateField(author, 'Author is a required field') ||
      !validateField(published, 'Published is a required field') ||
      !validateField(genres, 'Please add at least one genre')
    ) {
      return null
    }

    closeSnackbar()

    addBook({ variables: { title, author, published, genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(parseFloat(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook