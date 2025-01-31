export const typeDefs = `#graphql

    type User {
        id: ID!,
        name: String!,
        phone: String!,
        email: String!,
        address: String!
        list: [Loans]!
    }
    
    type Book {
        id: ID!,
        title: String!,
        author: String!,
        ISBN: String!,
        year: Int!
    }
    
    type Loans {
        id: ID!,
        user: User!,
        book: Book!,
        in: String!,
        out: String!
    }

    type Query {
        getUser:[User!]!
        getBook:[Book!]!
        getBorrowedBooks:[Loans!]!
    }
    type Mutation {
        addUser(name: String!, phone: String!, email: String!, address: String!):User! 
        addBook(title: String!, author: String!, ISBN: String!, year: Int!):Book!
        borrowBook(user: ID!, book: ID!, in: String!, out: String!):Loans!
        deleteBorrow(id: ID!):Boolean!
        updateUser(id: ID!, name: String, phone: String, email: String, address: String):User!
    }

`