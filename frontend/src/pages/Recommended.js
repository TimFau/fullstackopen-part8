import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ME } from "../queries"
import BooksTable from "../components/BooksTable"

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const me = useQuery(ME)

  if (!props.show) {
    return null
  }

  if (result.loading || me.loading) {
    return <div>Loading...</div>
  }

  const books = result?.data?.allBooks || []
  const favoriteGenre = me?.data?.me?.favoriteGenre || ''

  const filteredBooks = () => {
    return books.filter((book) => book.genres.includes(favoriteGenre))
  }

  return (
    <div>
        <h2>Recommended</h2>
        <div>Books in your favorite genre: {favoriteGenre}</div>
        <BooksTable books={filteredBooks()} />
    </div>
  )
}

export default Books
