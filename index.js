const express = require('express');
const app=express();
const cors=require('cors');
require('dotenv').config();
const jwt =require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port=process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJWT(req,res,next){
    const authorization=req.headers.authorization;
    if(!authorization){
        return res.status(401).send({message:"unAuthorization"})
    }
    const token=authorization.split(' ')[1]
    jwt.verify(token,process.env.TOKEN,function(err,decoded){
        if(err){
            return res.status(403).send({message:"forbidden"})}
            req.decoded=decoded
        next();
    });
  
}


const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fowny.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const productCollection = client.db("fashion").collection("shop");
        const profileCollection = client.db("fashion").collection("profile");
        app.get('/',(req,res)=>{
            res.send('data')
        })
        app.get('/shop', async(req,res)=>{
            const query={};
            const result=await productCollection.find(query).toArray();
            res.send(result); 
        });

        app.get('/productdetails/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)}
            const result=await productCollection.findOne(query);
            res.send(result)
        })

        app.post('/profile',async(req,res)=>{
            const query=req.body;
            const updateProfile=await profileCollection.insertOne(query);
            res.send(updateProfile)
        })
    
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log('database');
})

