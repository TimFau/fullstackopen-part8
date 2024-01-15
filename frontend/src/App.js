import { useEffect, useState } from 'react'
import Authors from './pages/Authors'
import Books from './pages/Books'
import NewBook from './pages/NewBook'
import Recommended from './pages/Recommended'
import Login from './pages/Login'
import TopNav from './components/TopNav'
import { useSnackbar } from 'notistack'
import { useApolloClient } from '@apollo/client'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState('')
  const client = useApolloClient()

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

  return (
    <div>
      <TopNav setPage={setPage} logout={logout} token={token} />

      <Authors show={page === 'authors'} />
      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} />
      <Recommended show={page === 'recommended'} />
      <Login show={page === 'login'} setToken={setToken} setPage={setPage} />
    </div>
  )
}

export default App
