import express from "express"; 
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
// import { auth } from "./middlewar/auth.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import cors from "cors";

dotenv.config();
const app = express();
// const PORT=4000;
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
await client.connect();
console.log("MongoDB is Connected ✨✨✨");
app.use(express.json());
app.use(cors());
app.get("/", function (request, response) {
  response.send("✨🤩Hi This is Vijay.M ✨🤩");
});
const ROLE_ID={
    ADMIN:"0",
    NORMAL_USER:"1",
  };
app.post("/signup", async (request, response) => {
    const {username,email,password} = request.body;
    // console.log(data);
    // const movie = await postMovies(data);
    const userFromDB=await getUserByName(username,email);
    console.log(userFromDB);
    if(userFromDB){
      response.send({message:"username already exits"})
    }
    else if(password.length<5){
  response.send({message:"password must be at 8 character"})
    }
    else{
      const hashpassword=await generateHashPassword(password)
      const result=await createUser({
        username:username,
        email:email,
        password:hashpassword,
    // default all user roleId set by one
        roleId:1,
      })
       response.send(result);
    }
    
  })


  app.post("/login", async (request, response) => {
    const {username,email,password} = request.body;
    // console.log(data);
    // const movie = await postMovies(data);
    const userFromDB=await getUserByName(username,email);
    // console.log(userFromDB);
    if(!userFromDB){
      response.status(401).send({message:"Invalid data"})
    }
    else{
      const storedDBPassword=userFromDB.password;
      const isPasswordCheck=await bcrypt.compare(password,storedDBPassword)
    //   console.log(isPasswordCheck);
    
    if(isPasswordCheck){
      const token=jwt.sign({id:userFromDB._id},process.env.SECRET_KEY);
      console.log(token);
      response.send({message:"SucessFul login",token:token,roleId:userFromDB.roleId});
    }
    else{
      response.status(401).send({message:"invalid data"});
    }
  }
})

app.listen(PORT, () => console.log(`The server started in Port: ${PORT} ✨✨`));
export async function generateHashPassword(password){
    const NO_ROUND=10;
     const salt= await bcrypt.genSalt(NO_ROUND);
     const hashpassword= await bcrypt.hash(password,salt);
     console.log(salt);
     console.log(hashpassword);
  return hashpassword;
  }
  export async function createUser(data) {
    return await client.db("newdb").collection('users').insertOne(data);
}
export async function getUserByName(username,email) {
    return await client.db("newdb").collection("users").findOne({$and:[{username:username},{email:email}]});
}