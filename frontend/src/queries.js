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
            author {
                name
            }
            published
            title
        }
  }
`

export const ADD_BOOK = gql`
    mutation AddBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(title: $title, author: $author, published: $published, genres: $genres) {
            author
            title
        }
    }
`

export const UPDATE_AUTHOR = gql`
    mutation EditAuthor($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            name
            born
        }
    }
`
