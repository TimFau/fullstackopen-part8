const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const mongoose = require('mongoose')
const { MongoClient, ObjectId } = require('mongodb')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
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

    createUser(
      username: String!
      favoriteGenre: String!
    ): User

    login(
      username: String!
      password: String!
    ): Token
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
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
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
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Invalid session, please login.', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
        return
      }
      const { title, author, published, genres } = args
      const existingAuthor = await Author.findOne({ name: args.author })
      let newAuthor
      if (!existingAuthor) {
        newAuthor = new Author({
          name: args.author
        })
        try {
          await newAuthor.save()
        } catch (error) {
          throw new GraphQLError('Saving author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              error
            }
          })
        }
      }

      const book = new Book({ ...args, author: existingAuthor ? existingAuthor._id : newAuthor._id })

      try {
        return await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
    },
    editAuthor: (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Invalid session, please login.', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
        return
      }
      const updatedAuthor =  async () => {
        return await Author.findOneAndUpdate({ name: args.name}, { born: args.setBornTo }, {
          new: true
        })
      }
      try {
        return updatedAuthor()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invaligArgs: args.born,
            error
          }
        })
      }
    },
    createUser: async (root, args) => {
      const newUser = new User({...args})
      try {
        return await newUser.save()
      } catch (error) {
        console.log(error)
        throw new GraphQLError('Saving user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invaligArgs: args.username,
            error
          }
        })
      }
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user) {
        throw new GraphQLError('Wrong username', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      if (args.password !== process.env.secret) {
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userInfo = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userInfo, process.env.SECRET)}
    }
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
