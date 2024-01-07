import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { AppBar, Button } from '@mui/material'

const App = () => {
  const [page, setPage] = useState('authors')

  return (
    <div>
      <AppBar position="static" sx={{ flexDirection: "row" }}>
        <Button onClick={() => setPage('authors')} variant="contained">authors</Button>
        <Button onClick={() => setPage('books')} variant="contained">books</Button>
        <Button onClick={() => setPage('add')} variant="contained">add book</Button>
      </AppBar>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
