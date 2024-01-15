import { useQuery } from '@apollo/client'
import { All_AUTHORS } from '../queries'
import SetBirthYear from '../components/SetBirthYear'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'

const Authors = (props) => {
  const result = useQuery(All_AUTHORS)
  
  if (!props.show) {
    return null
  }
  const authors = result?.data?.allAuthors || []

  if (result.loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Authors</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>born</TableCell>
            <TableCell>books</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {authors.map((a) => (
            <TableRow key={a.name}>
              <TableCell>{a.name}</TableCell>
              <TableCell>{a.born}</TableCell>
              <TableCell>{a.bookCount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <SetBirthYear authors={authors} />
    </div>
  )
}

export default Authors
