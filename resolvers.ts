import { Collection, ObjectId } from "mongodb";
import { BookModel, LoansModel, UserModel } from "./type.ts";
import { GraphQLError } from "graphql";
import { validateEmail, validatePhone } from "./utils.ts";

type Context = {
    UserCollection: Collection<UserModel>
    BookCollection: Collection<BookModel>
    LoansCollection: Collection<LoansModel>
}

type MutationArgsUser = {
    id: string,
    name: string, 
    phone: string, 
    email: string, 
    address: string
}
type MutationArgsBook = {
    title: string,
    author: string,
    ISBN: string,
    year: number
}
type MutationArgsLoans = {
    id: string,
    user: string,
    book: string,
    in: string,
    out: string
}

export const resolvers = {

    User: {
        id: (parent:UserModel) => parent._id.toString(),
        list: async(
            parent: UserModel,
            _:unknown,
            context: Context
        ) => {
            const result = await context.LoansCollection.find({user: parent._id}).toArray()
            return result
        }
    },
    Book: {
        id: (parent:BookModel) => parent._id.toString()
    },
    Loans: {
        id: (parent:LoansModel) => parent._id.toString(),
        user: async(
            parent: LoansModel,
            _:unknown,
            context: Context
        ) => await context.UserCollection.findOne({_id: parent.user}),
        book: async(
            parent: LoansModel,
            _:unknown,
            context: Context
        ) => await context.BookCollection.findOne({_id: parent.book}),
        in: (parent:LoansModel) => parent.in.toString(),
        out: (parent:LoansModel) => parent.out.toString(),
    },

    Query: {
        getUser: async(
            _:unknown,
            __:unknown,
            context: Context
        ):Promise<UserModel[]> => await context.UserCollection.find().toArray(),
        getBook: async(
            _:unknown,
            __:unknown,
            context: Context
        ):Promise<BookModel[]> => await context.BookCollection.find().toArray(),
        getBorrowedBooks: async(
            _:unknown,
            __:unknown,
            context: Context
        ):Promise<LoansModel[]> => await context.LoansCollection.find().toArray()
    },
    Mutation: {
        addUser: async(
            _:unknown,
            args: MutationArgsUser,
            context: Context
        ):Promise<UserModel> => {
            const comprobarUsuario = await context.UserCollection.findOne({$or: [
                {email: args.email},
                {phone: args.phone}
            ]})
            if(comprobarUsuario) throw new GraphQLError("El usuario ya existe")
            await validateEmail(args.email)
            await validatePhone(args.phone)
            const { insertedId } = await context.UserCollection.insertOne({...args})
            return {
                _id: insertedId,
                ...args
            }
        },
        addBook: async(
            _:unknown,
            args: MutationArgsBook,
            context: Context
        ):Promise<BookModel> => {
            const { insertedId } = await context.BookCollection.insertOne({...args})
            return {
                _id: insertedId,
                ...args
            }
        },
        borrowBook: async(
            _:unknown,
            args: MutationArgsLoans,
            context: Context
        ):Promise<LoansModel> => {
            const { book, user} = args
            const comprobarLibro = await context.BookCollection.findOne({_id: new ObjectId(book)})
            if(!comprobarLibro) throw new GraphQLError("El libro no existe")
            const libroPrestado = await context.LoansCollection.findOne({book: new ObjectId(book)})
            if(libroPrestado) throw new GraphQLError("El libro está prestado")
            const comprobarUsuario = await context.UserCollection.findOne({_id: new ObjectId(user)})
            if(!comprobarUsuario) throw new GraphQLError("El usuario no existe")
            const { insertedId } = await context.LoansCollection.insertOne({
                user: new ObjectId(user),
                book: new ObjectId(book),
                in: new Date(args.in),
                out: new Date(args.out)
            })
            return {
                _id: insertedId,
                user: new ObjectId(user),
                book: new ObjectId(book),
                in: new Date(args.in),
                out: new Date(args.out)
            }
        },
        deleteBorrow: async(
            _:unknown,
            args: MutationArgsLoans,
            context: Context
        ):Promise<boolean> => {
            const { deletedCount } = await context.LoansCollection.deleteOne({_id: new ObjectId(args.id)})
            if(deletedCount === 0) return false
            return true
        },
        updateUser: async(
            _:unknown,
            args: MutationArgsUser,
            context: Context
        ):Promise<UserModel> => {
            const comprobarUsuario = await context.UserCollection.findOne({$or: [
                {email: args.email},
                {phone: args.phone}
            ]})
            if(comprobarUsuario) throw new GraphQLError("El usuario ya existe")
            if (args.email) await validateEmail(args.email)
            if (args.phone) await validatePhone(args.phone)
            const { id, ...updateArgs } = args 
            const result = await context.UserCollection.findOneAndUpdate(
                {_id: new ObjectId(id)},
                {$set: {...updateArgs}},
                {returnDocument: "after"}
            )
            if(!result) throw new GraphQLError("El usuario no existe")
            return result
        }
    }
}