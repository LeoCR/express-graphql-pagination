# ExpressJs + GraphQL Pagination

This is a simple example about how to make a pagination in GraphQL using Cursor and Express with DataLoader.

## GraphQL Query
```gql
query posts($first: Int, $limit: Int) {
  posts (first: $first, limit: $limit){
    edges {
      node {
        title
        content
        user {
          id
          name
          email
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  } 
}
```

## Variables
```json
{
  "first": 4,
  "limit": 2,
}
```

## Result
```json
{
  "data": {
    "posts": {
      "edges": [
        {
          "node": {
            "title": "Post 5",
            "content": "Content 5",
            "user": {
              "id": "2",
              "name": "Bob",
              "email": "bob@example.com"
            }
          }
        },
        {
          "node": {
            "title": "Post 6",
            "content": "Content 6",
            "user": {
              "id": "1",
              "name": "Alice",
              "email": "alice@example.com"
            }
          }
        }
      ],
      "pageInfo": {
        "endCursor": "cG9zdDo2",
        "hasNextPage": false
      }
    }
  }
}
```

# How To run?

In the root of the project run into terminal this command: `npm run dev`
