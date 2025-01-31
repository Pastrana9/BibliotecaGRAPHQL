import { MongoClient, ObjectId } from "mongodb"
import { ContactModel } from "./type.ts";
import { changeContact, getPhone } from "./utils.ts";

const MONGO_URL = Deno.env.get("MONGO_URL")

if(!MONGO_URL) throw new Error("Error con MONGO_URL")

const client = new MongoClient(MONGO_URL)
await client.connect()
console.log("Conectado a MongoDB")

const db = client.db("agenda")
const ContactCollection = db.collection<ContactModel>("contact")

const handler = async(req:Request):Promise<Response> => {
  const url = new URL(req.url)
  const method = req.method
  const path = url.pathname

  if(method === "GET") {
    if(path === "/contact") {
      const result = await ContactCollection.find().toArray()
      const resultFinal = await Promise.all(result.map(e => changeContact(e)))
      return new Response(JSON.stringify(resultFinal))
    }
  } else if(method === "POST") {
    if(path === "/contact") {
      const body = await req.json()
      if(!body.name || !body.phone) return new Response("Bad request", {status:404})
      const comprobarPhone = await ContactCollection.findOne({phone: body.phone})
      if(comprobarPhone) return new Response("User already exists", {status:404})
      const { is_valid ,country, timezone } = await getPhone(body.phone)
      if(!is_valid) return new Response("Telefono no valido", {status:404})
      const args = { ...body, country, timezone }
      const { insertedId } = await ContactCollection.insertOne({...args})
      return new Response(JSON.stringify({
        id: insertedId.toString(),
        ...args
      }))
    }
  } else if(method === "PUT") { 
    if(path === "/contact") {
      const body = await req.json()
      if(!body.id) return new Response("Bad request", {status:404})
      if(body.phone) {
        const comprobarPhone = await ContactCollection.findOne({phone: body.phone})
        if(comprobarPhone) return new Response("User already exists", {status:404})
        const { is_valid, country, timezone } = await getPhone(body.phone)
        if(!is_valid) return new Response("Telefono no valido", {status:404})
        const { id, ...update} = body
        const args = { ...update, country, timezone }
        const result = await ContactCollection.findOneAndUpdate(
          {_id: new ObjectId(id)},
          {$set: {...args}},
          {returnDocument: "after"}
        )
        if(!result) return new Response("User not exist", {status:400})
        return new Response(JSON.stringify(await changeContact(result)))
      } else {
        const result = await ContactCollection.findOneAndUpdate(
          {_id: new ObjectId(body.id)},
          {$set: {name: body.name}},
          {returnDocument: "after"}
        )
        if(!result) return new Response("User not exist", {status:400})
        return new Response(JSON.stringify(await changeContact(result)))
      }

      
    }
  } else if(method === "DELETE") {
    if(path === "/contact") {
      const body = await req.json()
      if(!body.id) return new Response("Bad request", {status:404})
      const { deletedCount } = await ContactCollection.deleteOne({_id: new ObjectId(body.id)})
      if(deletedCount === 0) return new Response(JSON.stringify(false))
      return new Response(JSON.stringify(true))
    }
  }
  return new Response("Endpoint not found", {status:400})
}

Deno.serve({port:4000},handler)