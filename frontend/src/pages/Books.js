import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ALL_GENRES } from "../queries"
import { Box, CircularProgress, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState } from "react"
import BooksTable from "../components/BooksTable"


const Books = (props) => {
  const [currentGenre, setCurrentGenre] = useState('')
  const filteredBooksResult = useQuery(ALL_BOOKS)
  const genresResult = useQuery(ALL_GENRES)
  const allBooks = props.allBooks

  // TODO: Find a better way to handle updating the books by genre.
  // It violates the 'exhaustive-deps' rule but, if I add 'filteredBooksResult'
  // to the dependency array, this query will needlessly fetch twice
  useEffect(() => {
    // console.log('useEffect')
    if (currentGenre) {
      // console.log('useEffect refetch')
      filteredBooksResult.refetch()
    }
  }, [allBooks, currentGenre])

  if (!props.show) {
    return null
  }

  if (genresResult.loading) {
    return <div>Loading...</div>
  }

  const books = currentGenre ? filteredBooksResult?.data?.allBooks || [] : allBooks || []
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
    filteredBooksResult.refetch({ genre: currentGenre })
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
