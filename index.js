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
        const usersCollection = client.db("fashion").collection("users");
        const orderCollection = client.db("fashion").collection("order");
        
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
            const result= await productCollection.findOne(query);
            res.send(result);
        })
      
        // all create user login and update

        app.post('/users',async(req,res)=>{
            const query=req.body;
            const updateProfile=await usersCollection.insertOne(query);
            res.send(updateProfile)
        })

        app.put('users/:email',async(req,res)=>{
            const email=req.params.email;
            const query=req.body;
            const filter={email:email};
            const options = { upsert: true };
            const updateDoc={
                $set: query,
            };
            const result=await usersCollection.updateOne(filter,updateDoc,options);
            res.send(result)
        })
        
        app.get('/users/:email', async(req,res)=>{
            const email=req.params.email;
            const query={email:email};
            const result=await usersCollection.findOne(query);
            res.send(result)
          })

       

        app.put('/users/:email',async(req,res)=>{
            const email=req.params.email;
            const user=req.body;
            const filter={email:email};
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
              };
              const result=await usersCollection.updateOne(filter,updateDoc,options)
              const token=jwt.sign({email:email},process.env.TOKEN,{ expiresIn: '1h' })
              res.send({result,token})
        })


        app.post('/order',async(req,res)=>{
            const order=req.body;
            const result=await orderCollection.insertOne(order);
            res.send(result)
        })

        app.get('/order',async(req,res)=>{
            const query={};
            const result=await orderCollection.find(query).toArray();
            res.send(result)
        })
      
        app.delete('/order/:id',  async(req,res)=>{
            const id=req.params.id;
            const filter={_id:ObjectId(id)}
            const result=await orderCollection.deleteOne(filter);
            res.send(result)
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

