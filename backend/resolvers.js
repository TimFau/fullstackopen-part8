const { MongoClient, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const { GraphQLError } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const pubsub = new PubSub()

async function findBooksByGenre(genre, authorId) {
    const client = new MongoClient(process.env.MONGODB_URI)
  
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
        // console.log('allBooks')
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
          await book.save()
        } catch (error) {
          throw new GraphQLError('Saving book failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }

        pubsub.publish('BOOK_ADDED', { bookAdded: book })
        return book
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
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        }
    }
}

module.exports = resolvers