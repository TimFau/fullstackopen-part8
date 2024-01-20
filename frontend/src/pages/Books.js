import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ALL_GENRES } from "../queries"
import { Box, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from "react"
import BooksTable from "../components/BooksTable"

const useBooksQuery = (genre) => {
  const query = useQuery(ALL_BOOKS, { variables: { genre: genre } })
  return query
}

const Books = (props) => {
  const [currentGenre, setCurrentGenre] = useState('')
  const filteredBooksResult = useBooksQuery(currentGenre)
  const genresResult = useQuery(ALL_GENRES)

  if (!props.show) {
    return null
  }

  if (genresResult.loading) {
    return <div>Loading...</div>
  }

  const books = currentGenre ? filteredBooksResult?.data?.allBooks || [] : props.allBooks || []
  const genres = genresResult?.data.allBooks || []
  const uniqueGenres = []

  genres.forEach((book) => {
    book.genres.forEach((genre) => {
      if (uniqueGenres.indexOf(genre) === -1) {
        uniqueGenres.push(genre)
      }
    })
  })

  const handleSetCurrentGenre  = (genre) => {
    setCurrentGenre(genre)
    filteredBooksResult.refetch({ genre: genre })
  }

  return (
    <div>
      <h2>Books</h2>
      {currentGenre &&
        <div>Selected genre: {currentGenre}</div>
      }
      {filteredBooksResult.loading &&
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress sx={{ p: 4 }} />
        </Box>
      }
      {!filteredBooksResult.loading && <BooksTable books={books} />}
      <ToggleButtonGroup exclusive fullWidth sx={{ pt: 4 }}>
        <ToggleButton value="all" selected={currentGenre === ''} onClick={() => handleSetCurrentGenre('')}>All</ToggleButton>
          {uniqueGenres.map((genre) => <ToggleButton value={genre} key={genre} selected={genre === currentGenre} onClick={() => handleSetCurrentGenre(genre)}>{genre}</ToggleButton>)}
      </ToggleButtonGroup>
    </div>
  )
}

export default Books
