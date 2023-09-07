//* IMPORTAÇÕES
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
} = require("graphql");
const jwt = require("jsonwebtoken");
//* INSTANCIAR O EXPRESS
const app = express();
//* DADOS SIMULADOS
const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
];
const books = [
  { id: 1, title: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, title: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, title: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, title: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, title: "The Two Towers", authorId: 2 },
  { id: 6, title: "The Return of the King", authorId: 2 },
];
//* AUTENTICAÇÃO
const secretKey = "secret";

function verifyToken(req, res, next) {
  let token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  token = token.slice(7);
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(403).json({ message: "Unauthorized" });
    }
    console.log(decoded);
    req.user = decoded;
    next();
  });
}

//* DEFINIR TIPOS DO GRAPHQL
const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => books.filter((book) => book.authorId === author.id),
    },
  }),
});
const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLInt },
    title: { type: GraphQLString },
    authorId: { type: GraphQLInt },
    author: {
      type: AuthorType,
      resolve: (book) => authors.find((author) => author.id === book.authorId),
    },
  }),
});
//* DEFINIR QUERIES
const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  fields: () => ({
    book: {
      type: BookType,
      description: "A single book",
      args: { id: { type: GraphQLInt } },
      resolve: (parent, args) => books.find((book) => book.id === args.id),
    },
    books: {
      type: new GraphQLList(BookType),
      description: "List of all books",
      resolve: () => books,
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: "List of all authors",
      resolve: () => authors,
    },
    author: {
      type: AuthorType,
      description: "A single author",
      args: { id: { type: GraphQLInt } },
      resolve: (parent, args) =>
        authors.find((author) => author.id === args.id),
    },
  }),
});

//* CRIAR SCHEMA
const schema = new GraphQLSchema({
  query: RootQueryType,
});
app.use(
  "/graphql",
  verifyToken,
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
);
//* EXECUTAR O SERVIDOR
const port = 3000;
app.listen(port, () => console.log(`🚀🚀🚀Server running on port ${port}`));
