import { Stack, Select, MenuItem, InputLabel, TextField, Button, FormControl } from "@mui/material"
import { UPDATE_AUTHOR, All_AUTHORS } from '../queries'
import { useMutation } from "@apollo/client"
import { useSnackbar } from 'notistack'

const SetBirthYear = (props) => {

    const { enqueueSnackbar } = useSnackbar()

    const [ updateAuthor ] = useMutation(UPDATE_AUTHOR, {
        refetchQueries: [ { query: All_AUTHORS } ],
        onError: (error) => {
            console.log(error)
            // console.log('error', errors.graphQLErrors)
            error.graphQLErrors.map(error => enqueueSnackbar(error.message, { variant: 'error' }))
          },
          onCompleted: (response) => {
            console.log(response)
            const authorName = response.editAuthor.name
            enqueueSnackbar(`${authorName} updated`, { variant: 'success' })
          }
    })

    const submit = async (event) => {
        event.preventDefault()

        const name = event.target.author.value
        const setBornTo = parseFloat(event.target.born.value)
        if (!setBornTo) {
            enqueueSnackbar('"Born" is a required field', { variant: 'error' })
            return null
        }

        updateAuthor({ variables: { name, setBornTo } })
    }

    return (
        <div>
            <h2>Set birthyear</h2>
            <form onSubmit={submit}>
                <Stack spacing={2}>
                    <FormControl>
                        <InputLabel id="author-label">Author</InputLabel>
                        <Select name="author" label="Author" defaultValue={props.authors[0].name}>
                            {props.authors.map(author => <MenuItem value={author.name} key={author.name}>{author.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl style={{ maxWidth: "200px"}}>
                        <TextField
                            id="author-born"
                            name="born"
                            label="Born"
                            type="number"
                        />
                    </FormControl>
                    <Button type="submit" variant="contained">Update Author</Button>
                </Stack>
            </form>
        </div>
    )
}

export default SetBirthYear