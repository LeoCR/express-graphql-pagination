const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const DataLoader = require("dataloader");

// Simulated database
const users = [
  { id: "1", name: "Alice", email: "alice@example.com" },
  { id: "2", name: "Bob", email: "bob@example.com" },
];

const posts = [
  { id: "1", title: "Post 1", content: "Content 1", userId: "1" },
  { id: "2", title: "Post 2", content: "Content 2", userId: "1" },
  { id: "3", title: "Post 3", content: "Content 3", userId: "2" },
  { id: "4", title: "Post 4", content: "Content 4", userId: "2" },
  { id: "5", title: "Post 5", content: "Content 5", userId: "2" },
  { id: "6", title: "Post 6", content: "Content 6", userId: "1" },
];

// Function to create cursor
const createCursor = (id) => Buffer.from(`post:${id}`).toString("base64");

// Schema definition
const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    posts: [Post]
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    user: User
  }

  type PostEdge {
    cursor: ID!
    node: Post!
  }

  type PostConnection {
    edges: [PostEdge!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    endCursor: ID
    hasNextPage: Boolean!
  }

  type Query {
    users: [User]
    posts(first: Int, limit: Int): PostConnection!
    user(id: ID!): User
    post(id: ID!): Post
  }
`;

// Resolvers
const resolvers = {
  Query: {
    users: () => users,
    posts: (parent, { first = 3, limit }) => {
      let startIndex = first;
      
      let slicedPosts = posts.slice(startIndex);

      // Apply limit if specified, but respect 'first' if both are provided
      if (limit) {
        slicedPosts = slicedPosts.slice(0, limit);
      } else {
        slicedPosts = slicedPosts.slice(0, first);
      }

      const edges = slicedPosts.map((post) => ({
        cursor: createCursor(post.id),
        node: post,
      }));
      const endCursor =
        edges.length > 0 ? edges[edges.length - 1].cursor : null;
      const hasNextPage = startIndex + slicedPosts.length < posts.length;

      return {
        edges,
        pageInfo: {
          endCursor,
          hasNextPage,
        },
      };
    },
    user: (parent, args) => users.find((user) => user.id === args.id),
    post: (parent, args) => posts.find((post) => post.id === args.id),
  },
  User: {
    posts: (parent) => posts.filter((post) => post.userId === parent.id),
  },
  Post: {
    user: (parent) => users.find((user) => user.id === parent.userId),
  },
};

// DataLoader example for batching
const createUserLoader = () => {
  return new DataLoader(async (userIds) => {
    return userIds.map((userId) => users.find((user) => user.id === userId));
  });
};

// Apollo Server setup with Express
const startServer = async () => {
  const app = express();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({
      loaders: {
        userLoader: createUserLoader(),
      },
    }),
  });

  await server.start();
  server.applyMiddleware({ app });

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(
      `Server is running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
};

startServer();
