import { useEffect, useState } from 'react'
import Authors from './pages/Authors'
import Books from './pages/Books'
import NewBook from './pages/NewBook'
import Recommended from './pages/Recommended'
import Login from './pages/Login'
import TopNav from './components/TopNav'
import { useSnackbar } from 'notistack'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import { ALL_BOOKS, BOOK_ADDED } from './queries'

export const updateCache = (cache, query, bookAdded) => {
  console.log('updateCahce', query)
  const uniqueByTitle = (books) => {
    let seen = new Set()
    return books.filter((book) => {
      let currentBook = book.title
      return seen.has(currentBook) ? false : seen.add(currentBook)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqueByTitle(allBooks.concat(bookAdded))
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState('')
  const client = useApolloClient()
  const booksResult = useQuery(ALL_BOOKS)
  console.log('booksResult', booksResult)

  const { enqueueSnackbar } = useSnackbar()
  const logout = () => {
    setToken('')
    localStorage.setItem('user-token', '')
    client.resetStore()
    enqueueSnackbar('Logged out', { variant: 'success' })
  }

  useEffect(() => {
    const userToken = localStorage.getItem('user-token')
    if (userToken) {
      setToken(userToken)
    }
  }, [])

  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      console.log('BOOK_ADDED', data)

      const bookAdded = data.data.bookAdded
      enqueueSnackbar(`${bookAdded.title} added`, { variant: 'info' })

      updateCache(client.cache, { query: ALL_BOOKS }, bookAdded)
    }
  })

  return (
    <div>
      <TopNav setPage={setPage} logout={logout} token={token} />

      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} allBooks={booksResult?.data?.allBooks} />
      <NewBook show={page === 'add'} />
      <Recommended show={page === 'recommended'} />
      <Login show={page === 'login'} setToken={setToken} setPage={setPage} />
    </div>
  )
}

export default App
