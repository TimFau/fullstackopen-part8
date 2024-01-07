import { gql } from "@apollo/client"

export const All_AUTHORS = gql`
    query AllAuthors {
        allAuthors {
            bookCount
            born
            name
        }
  }
`

export const ALL_BOOKS = gql`
    query AllBooks {
        allBooks {
            author
            published
            title
        }
  }
`