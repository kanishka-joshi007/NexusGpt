import {API} from "./axios"

export const sendMessageAPI = (data)=>{
return API.post("/chat",data)
}