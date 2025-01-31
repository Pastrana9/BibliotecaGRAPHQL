import { MongoClient } from 'mongodb';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from "./typeDefs.ts";
import { resolvers } from "./resolvers.ts";
import { BookModel, LoansModel, UserModel } from "./type.ts";

const MONGO_URL = Deno.env.get("MONGO_URL") || "";
if (!MONGO_URL) {
  console.error("MONGO_URL no está definido. Verifica tus variables de entorno.");
  Deno.exit(1);
}

let client;
try {
  client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Conectado a MongoDB");
} catch (error) {
  console.error("Error conectando a MongoDB:", error);
  Deno.exit(1);
}

const db = client.db("biblioteca");
const UserCollection = db.collection<UserModel>("user");
const BookCollection = db.collection<BookModel>("book");
const LoansCollection = db.collection<LoansModel>("loan");

const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  context: async () => ({ UserCollection, BookCollection, LoansCollection }),
});

console.log(`🚀 Servidor listo en: ${url}`);
