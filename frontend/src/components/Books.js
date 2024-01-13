import { useQuery } from "@apollo/client"
import { ALL_BOOKS } from "../queries"
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>Loading...</div>
  }

  const books = result?.data?.allBooks || []

  return (
    <div>
      <h2>Books</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>author</TableCell>
            <TableCell>published</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((a) => (
            <TableRow key={a.title}>
              <TableCell>{a.title}</TableCell>
              <TableCell>{a.author.name}</TableCell>
              <TableCell>{a.published}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default Books
