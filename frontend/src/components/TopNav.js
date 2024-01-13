import { AppBar, Button } from '@mui/material'

const TopNav = ({ setPage }) => (
    <AppBar position="static" sx={{ flexDirection: "row" }}>
        <Button onClick={() => setPage('authors')} variant="contained">authors</Button>
        <Button onClick={() => setPage('books')} variant="contained">books</Button>
        <Button onClick={() => setPage('add')} variant="contained">add book</Button>
    </AppBar>
)

export default TopNav