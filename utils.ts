import { GraphQLError } from "graphql";
import { API_Email, API_Phone } from "./type.ts";

const API_KEY = Deno.env.get("API_KEY")

export const validateEmail = async(email:string) => {
    if(!API_KEY) throw new Error("Error en la API_KEY")
    
    const url = `https://api.api-ninjas.com/v1/validateemail?email=${email}`


    const data = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY
          }
    })
    if(data.status !== 200) throw new GraphQLError("Error con la API de emails")
    const result:API_Email = await data.json()
    if(!result.is_valid) 
        throw new GraphQLError("El email no existe")


}
export const validatePhone = async(phone:string) => {
    if(!API_KEY) throw new Error("Error en la API_KEY")
    const url = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`
    const data = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY
          }
    })
    if(data.status !== 200) throw new GraphQLError("Error con la API de telefono")
    const result:API_Phone = await data.json()
    if(!result.is_valid) throw new GraphQLError("El numero no existe")
}