import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

const BooksTable = ({ books }) => (
    <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>author</TableCell>
            <TableCell>published</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books.map((book) => (
            <TableRow key={book.title}>
              <TableCell>{book.title}</TableCell>
              <TableCell>{book.author.name}</TableCell>
              <TableCell>{book.published}</TableCell>
            </TableRow>
          ))}
        </TableBody>
    </Table>
)

export default BooksTable