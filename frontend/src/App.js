import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import TopNav from './components/TopNav'

const App = () => {
  const [page, setPage] = useState('authors')

  return (
    <div>
      <TopNav setPage={setPage} />

      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
