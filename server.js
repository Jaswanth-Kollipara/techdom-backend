const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const cors= require('cors')
const bcrypt=require('bcrypt')
const app = express()
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

//used for getting all the rows from the login table
app.get('/logindata',async(req,res)=>{
    const getQuerry=`select * from login;`;
    const getArray=await db.all(getQuerry);
    res.send(getArray);
});

//used for creating new user in login table 
app.post('/login/user',async(req,res)=>{
    const {name,password}=req.body;
    const selectUser=`select * from login where name='${name}';`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const dbUser=await db.get(selectUser);
    if(dbUser===undefined){
        try{
            const createUser=`insert into login(name,password) values('${name}', '${hashedPassword}');`;
            const dbResponse=await db.run(createUser);
            const id=dbResponse.lastID;
            res.send({id: id});
        }
        catch(e){
            res.status=400;
            res.send({error_msg: e.message});
        }
    }
    else{
        res.status=400;
        res.send({error_msg: "User already exists"});
    }
});

//used for logging of user using login table
app.post('/login',async (req,res)=>{
    const {name,password}=req.body;
    console.log(name);
    const selectUser=`select * from login where name='${name}';`;
    const dbUser=await db.get(selectUser);
    if(dbUser===undefined){
        res.status(400);
        res.send({error_msg: "Invalid user"});
    }
    else{
        const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
        if(isPasswordMatched===true){
            const id=dbUser.id
            res.send({id: id});
        }
        else{
            res.status(400);
            res.send({error_msg: "Invalid Password"});
        }
    }
})

//used for getting all the rows from the loan table
app.get('/loandata',async(req,res)=>{
    const getQuerry=`select * from loan;`;
    const getArray=await db.all(getQuerry);
    res.send(getArray);
});

//used for getting all the rows from the loan table
//admins can view which loans they need to approve after seeing this
app.get('/adminloandata',async(req,res)=>{
    const getQuerry=`select * from loan where is_approved=${false};`;
    const getArray=await db.all(getQuerry);
    res.send(getArray);
})

//used for getting specific row from the loan table using loan_id
//using this we can display the terms which are remaining and have to pay of a particular loan user made to the user 
app.get('/loan/:loanId/',async(req,res)=>{
    const {loanId}=req.params;
    const getQuerry=`select * from loan where loan_id=${loanId};`;
    const getArray=await db.get(getQuerry);
    res.send(getArray);
});

//used for getting specific row from the loan table using id
//using this user can view all the loans he needed to clear
app.get('/id/:id',async(req,res)=>{
    const {id}=req.params;
    const getQuerry=`select * from loan where id=${id};`;
    const getArray=await db.all(getQuerry);
    res.send(getArray);
})

//used for creating a new loan for the user
app.post('/loan',async(req,res)=>{
    const {amount,term,isApproved,id,date}=req.body;
    const addLoan=`insert into loan (amount,term,term_pending,is_approved,id,date,amount_remain) values ('${id}', ${amount}, ${term}, ${term}, ${isApproved}, '${id}', '${date}', ${amount});`;
    const dbResponse=await db.run(addLoan);
    res.send("Inserted Successfully");
});

//used for updating the loan status of the laon using loan_id
//admin uses this to approve the loan user makes
app.put('/updatestatus/loan/:loanId/',async(req,res)=>{
    const {loanId}=req.params;
    const updateLoanState=`update loan set is_approved=${true} where loan_id=${loanId};`;
    const dbResponse=await db.run(updateLoanState);
    res.send("Status updated");
});