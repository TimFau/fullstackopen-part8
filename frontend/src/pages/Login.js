import { Button, FormControl, TextField, Stack } from "@mui/material"
import { LOGIN } from '../queries'
import { useSnackbar } from 'notistack'
import { useMutation } from "@apollo/client"

const Login = ({ show, setToken, setPage }) => {
    const { enqueueSnackbar } = useSnackbar()

    const [ login ] = useMutation(LOGIN, {
        onCompleted: (response) => {
            const responseToken = response.login.value
            setToken(responseToken)
            localStorage.setItem('user-token', responseToken)
            setPage('authors')
            enqueueSnackbar('Logged in', { variant: 'success' })
        }
    })

    const submit = async (event) => {
        event.preventDefault()

        const username = event.target.username.value
        const password = event.target.password.value

        if (!username) {
            enqueueSnackbar('"Username" is a required field', { variant: 'error' })
        }

        if (!password) {
            enqueueSnackbar('"Password" is a required field', { variant: 'error' })
        }

        if (!username || !password) {
            return null
        }

        // Login
        login({ variables: { username, password } })
    }

    if (!show) {
        return null
    }
    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={submit} >
                <Stack spacing={2}>
                    <FormControl>
                        <TextField label="Username" name="username"></TextField>
                    </FormControl>
                    <FormControl>
                        <TextField label="Password" name="password" type="password"></TextField>
                    </FormControl>
                    <Button type="submit" variant="contained">Login</Button>
                </Stack>
            </form>
        </div>
    )
}

export default Login