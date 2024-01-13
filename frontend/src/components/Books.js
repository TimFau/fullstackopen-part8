import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from "react"

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [currentGenre, setCurrentGenre] = useState('')

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const books = result?.data?.allBooks || []
  const uniqueGenres = []

  books.forEach((book) => {
    book.genres.forEach((genre) => {
      if (uniqueGenres.indexOf(genre) === -1) {
        uniqueGenres.push(genre)
      }
    })
  })

  const filteredBooks = () => {
    if (currentGenre && currentGenre !== 'all') {
      return books.filter((book) => book.genres.includes(currentGenre))
    }
    return books
  }

  return (
    <div>
      <h2>Books</h2>
      {currentGenre &&
        <div>Selected genre: {currentGenre}</div>
      }
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>author</TableCell>
            <TableCell>published</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBooks().map((book) => (
            <TableRow key={book.title}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author.name}</TableCell>
              <TableCell>{book.published}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ToggleButtonGroup exclusive fullWidth sx={{ pt: 4 }}>
      <ToggleButton value="all" selected={currentGenre === 'all'} onClick={() => setCurrentGenre('all')}>All</ToggleButton>
        {uniqueGenres.map((genre) => <ToggleButton value={genre} key={genre} selected={genre === currentGenre} onClick={() => setCurrentGenre(genre)}>{genre}</ToggleButton>)}
      </ToggleButtonGroup>
    </div>
  )
}

export default Books
