const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const cors= require('cors')
const app = express()
// const bcrypt = require('bcrypt')
// const jwt = require('jsonwebtoken')
app.use(express.json())
const dbPath = path.join(__dirname, 'techdom.db')
let db = null
app.use(cors());

const initializeDBAndServer=async ()=>{
    try{
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log('Server Running at http://localhost:3000/')
        });
    }
    catch(e){
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    }
};
initializeDBAndServer();
// const bcrypt = require("bcrypt");
/** 
 const hashedPassword=await bcrypt.hash(request.body.password,10);

**/

app.get('/techdom',async(req,res)=>{
    const getQuerry=`select * from techdom;`;
    const getArray=await db.all(getQuerry);
    res.send(getArray);
});