import { AppBar, Button } from '@mui/material'

const TopNav = ({ setPage, logout, token }) => (
    <AppBar position="static" sx={{ flexDirection: "row" }}>
        <Button onClick={() => setPage('authors')} variant="contained">Authors</Button>
        <Button onClick={() => setPage('books')} variant="contained">Books</Button>
        {token &&
            <>
                <Button onClick={() => setPage('add')} variant="contained">Add book</Button>
                <Button onClick={() => setPage('recommended')} variant="contained">Recommended</Button>
                <Button onClick={() => logout()} variant="contained">Logout</Button>
            </>
        }
        {!token && 
            <Button onClick={() => setPage('login')} variant="contained">Login</Button>
        }
    </AppBar>
)

export default TopNav