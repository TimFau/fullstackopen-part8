import { useState } from 'react'
import { ADD_BOOK, ALL_BOOKS, All_AUTHORS } from '../queries'
import { useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'
import { Stack, TextField, Button, FormControl, List, ListItem } from "@mui/material"

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
      // Below causes duplicate notifications about book added.
      // - Ideally, we should show the success variant if added by the user, and info variant if not 
      // const bookTitle = response.addBook.title
      // enqueueSnackbar(`${bookTitle} Added`, { variant: 'success' })
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
    if (genre.includes(' ')) {
      enqueueSnackbar('Genre cannot contain spaces', { variant: 'error' })
    } else {
      setGenres(genres.concat(genre))
      setGenre('')
    }
  }

  return (
    <div>
      <h2>Add Book</h2>
      <form onSubmit={submit}>
        <Stack spacing={2}>
          <FormControl>
            <TextField
              value={title}
              label="Title"
              onChange={({ target }) => setTitle(target.value)}
            />
          </FormControl>
          <FormControl>
            <TextField
              value={author}
              label="Author"
              onChange={({ target }) => setAuthor(target.value)}
            />
          </FormControl>
          <FormControl>
            <TextField
              type="number"
              value={published}
              label="Published"
              onChange={({ target }) => setPublished(parseFloat(target.value))}
            />
          </FormControl>
          <FormControl>
            <TextField
              value={genre}
              label="Genre"
              onChange={({ target }) => setGenre(target.value)}
            />
            <Button onClick={addGenre} type="button">
              add genre
            </Button>
          </FormControl>
          <List>Genres: {genres.map(genre => <ListItem key={genre}>{genre}</ListItem>)}</List>
          <Button type="submit" variant="contained">Create Book</Button>
        </Stack>
      </form>
    </div>
  )
}

export default NewBook