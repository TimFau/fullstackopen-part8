import { gql } from "@apollo/client"

export const AUTHOR_FIELDS = gql`
    fragment AuthorFields on Author {
        name
        born
        bookCount
    }
`

export const All_AUTHORS = gql`
    ${AUTHOR_FIELDS}
    query AllAuthors {
        allAuthors {
            ...AuthorFields
        }
  }
`

export const UPDATE_AUTHOR = gql`
    ${AUTHOR_FIELDS}
    mutation EditAuthor($name: String!, $setBornTo: Int!) {
        editAuthor(name: $name, setBornTo: $setBornTo) {
            ...AuthorFields
        }
    }
`

export const BOOK_FIELDS = gql`
  ${AUTHOR_FIELDS}
  fragment BookFields on Book {
    author {
        ...AuthorFields
    }
    published
    title
    genres
  }
`

export const ALL_BOOKS = gql`
    ${BOOK_FIELDS}
    query AllBooks($genre: String) {
        allBooks(genre: $genre) {
            ...BookFields
        }
  }
`

export const ADD_BOOK = gql`
    ${BOOK_FIELDS}
    mutation AddBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(title: $title, author: $author, published: $published, genres: $genres) {
            ...BookFields
        }
    }
`

export const BOOK_ADDED = gql`
    ${BOOK_FIELDS}
    subscription {
        bookAdded {
            ...BookFields
        }
    }
`

export const ALL_GENRES = gql`
    query AllBooks {
        allBooks {
            genres
        }
  }
`

export const ME = gql`
  query Me {
    me {
        username
        favoriteGenre
    }
  }
`

export const LOGIN = gql`
    mutation login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`
