import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ME } from "../queries"
import BooksTable from "../components/BooksTable"

const Books = (props) => {
  const me = useQuery(ME)
  const favoriteGenre = me?.data?.me?.favoriteGenre || ''
  const result = useQuery(ALL_BOOKS, { variables: { genre: favoriteGenre } })
  const books = result?.data?.allBooks || []

  if (!props.show) {
    return null
  }

  if (result.loading || me.loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
        <h2>Recommended</h2>
        <div>Books in your favorite genre: {favoriteGenre}</div>
        <BooksTable books={books} />
    </div>
  )
}

export default Books
