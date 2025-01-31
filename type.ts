import { OptionalId, ObjectId } from "mongodb";

export type UserModel = OptionalId<{
    name: string,
    phone: string,
    email: string,
    address: string
}>

export type BookModel = OptionalId<{
    title: string,
    author: string,
    ISBN: string,
    year: number
}>

export type LoansModel = OptionalId<{
    user: ObjectId,
    book: ObjectId,
    in: Date,
    out: Date
}>

// https://api-ninjas.com/api/validatephone
export type API_Phone = {
    is_valid: boolean
}

// https://api-ninjas.com/api/validateemail
export type API_Email = {
    is_valid: boolean
}