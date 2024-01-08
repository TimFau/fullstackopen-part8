const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const { MongoClient, ObjectId } = require('mongodb')
const Book = require('./models/book')
const Author = require('./models/author')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

const typeDefs = `
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

async function findBooksByGenre(genre, authorId) {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db()

    let query = { genres: { $in: [genre] } }

    if (authorId) {
      query.author = new ObjectId(authorId)
    }

    const books = await db.collection('books').find(query).toArray()

    return books
  } finally {
    await client.close();
  }
}

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        const author = async () => {
          return await Author.findOne({ name: args.author }).exec()
        }
        const authorResult = await author()
        const authorId = authorResult.id
        if (args.genre) {
          const booksByGenreAndAuthor = findBooksByGenre(args.genre, authorId)
          return await booksByGenreAndAuthor
        }
        return Book.find({ author: authorId })
      }
      if (args.genre) {
        const booksByGenre = findBooksByGenre(args.genre)
        return await booksByGenre
      }

      return Book.find({})
    },
    allAuthors: async () => Author.find({})
  },
  Book: {
    author(parent) {
      const authorData = async () => {
        return await Author.findById(parent.author)
      }
      return authorData()
    }
  },
  Author: {
    bookCount: (root) => {
      const authorId = root._id
      const booksCount = async () => {
        return await Book.countDocuments({ author: authorId })
      }
      return booksCount()
    }
  },
  Mutation: {
    addBook: async (root, args) => {
      const { title, author, published, genres } = args
      const existingAuthor = await Author.findOne({ name: args.author })
      let newAuthor
      if (!existingAuthor) {
        newAuthor = new Author({
          name: args.author
        })
        await newAuthor.save()
      }

      const book = new Book({ ...args, author: existingAuthor ? existingAuthor._id : newAuthor._id })

      return await book.save()
    },
    editAuthor: (root, args) => {
      const index = authors.findIndex(author => author.name === args.name)
      if (index !== -1) {
        const authorToUpdate = authors[index]
        authorToUpdate.born = args.setBornTo
        return authorToUpdate
      } 
      return null
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
