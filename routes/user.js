const express = require("express"), mysql = require("mysql"), request = require("request"), multer =require('multer'),path = require('path'),jwt = require("jsonwebtoken"),fs = require('fs');
const config = require("../config");

const router = express.Router();
const pool = mysql.createPool(config.database);

router.use(express.static('uploads'));

var upload = multer({ dest: 'uploads/' })

var filename="";

let storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, './uploads')
    },
    filename: function(req, file, callback) {
        filename= filename = Date.now() + path.extname(file.originalname); 
        callback(null,filename)
}
})

function getConnection(){
    return new Promise(function(resolve, reject){
        pool.getConnection(function(err,conn){
            if(err){
                reject(err);
            }else{
                resolve(conn);
            }
        });
    });
}

function executeQuery(conn, query){
    return new Promise(function (resolve, reject){
        conn.query(query, function(err, result){
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        });
    });
}

//register user
router.post("/register",async(req,res)=>{
    let upload = multer({
        storage: storage,
        fileFilter: function(req, file, callback) {
            let ext = path.extname(file.originalname)
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG' ) {
                return callback(res.end('Only images are allowed'), null)
            }
            callback(null, true)
        }
    }).single('profile_picture');

    upload(req, res, async function(err) {
        if(filename==""){
            res.status(400).send("Gambar Tidak Ada");
        }
        else{
            var username = req.body.username;
            var password = req.body.password;
            var name = req.body.name;
            var phone_number = req.body.phone_number;
    
            if(!username){
                res.status(400).send("Username Kosong");
            }else if(!password){
                res.status(400).send("Password Kosong");
            }else if(!name){
                res.status(400).send("name Kosong");
            }else if(!phone_number){
                res.status(400).send("phone number Kosong");
            }else{
                const conn = await getConnection();
                const check = await executeQuery(conn,`select*from user where username='${username}'`);
                if(check.length>0){
                    conn.release();
                    res.status(400).send("Username sudah terpakai");
                }else{
                    const insert = await executeQuery(conn, `insert into user values('${username}','${password}','${name}','${phone_number}',0,'${filename}')`);
                    // conn.release();
                    const insertBookshelf = await executeQuery(conn, `insert into h_bookshelf values('${username}',0)`);
                    conn.release();
                    res.status(200).send("akun "+ username + " berhasil dibuat");
                }
            }
        }
    });
});

//login user
router.post("/login", async(req,res)=>{
    var username = req.body.username;
    var password = req.body.password;

    if(!username){
        res.status(400).send("Username Kosong");
    }else if(!password){
        res.status(400).send("Password Kosong");
    }else{
        const conn = await getConnection();
        const check = await executeQuery(conn,`select * from user where username='${username}' and password='${password}'`);
        if(check.length>0){
            const token = jwt.sign({    
                "username":check[0].username,
                "password":check[0].password,
                "name":check[0].name,
                "phone_number":check[0].phone_number,
                "type":check[0].type,
                "profile_picture":check[0].profile_picture
            }   ,"proyek-soa");
            conn.release();
            res.status(200).send(token);
        }else{
            conn.release();
            res.status(400).send("akun tidak ditemukan");
        }
    }
});

//update informasi user
router.put("/updateUser/:username", async(req,res)=>{
    var username = req.params.username;
    const token = req.header("x-auth-token");

    let upload = multer({
        storage: storage,
        fileFilter: function(req, file, callback) {
            let ext = path.extname(file.originalname)
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG' ) {
                return callback(res.end('Only images are allowed'), null)
            }
            callback(null, true)
        }
    }).single('profile_picture');

    if(!username){
        res.status(400).send("Username Kosong");
    } 
    let user ={};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyek-soa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if(user.username!=username){
        res.status(404).send("Username Tidak Sesuai Dengan Token");
    }
    upload(req, res, async function(err) {
        if(filename==""){
            filename=user.profile_picture;
        }
        else{
            var password = req.body.password;
            var name = req.body.name;
            var phone_number = req.body.phone_number;
    
            if(!password){
                password=user.password;
            }else if(!name){
                name=user.name;
            }else if(!phone_number){
                phone_number=user.phone_number;
            }else{
                const conn = await getConnection();
                const check = await executeQuery(conn,`select*from user where username='${username}' && password='${user.password}'`);
                if(check.length>0){
                    const update = await executeQuery(conn,`update user set password='${password}', name='${name}', phone_number='${phone_number}',profile_picture='${filename}' where username='${username}'`)
                    conn.release();
                    var obj={
                        message:"Update informasi berhasil",
                        username:username,
                        password:password,
                        name:name,
                        phone_number:phone_number,
                        type:user.type,
                        profile_picture:filename
                    };
                    res.status(200).send(obj);
                }else{
                    conn.release();
                    res.status(400).send("Akun tidak ditemukan");
                }
            }
        }
    });
});

//delete user
router.delete("/:username", async(req,res)=>{
    var username = req.params.username;
    const token = req.header("x-auth-token");

    if(!username){
        res.status(400).send("Username Kosong");
    } 
    let user ={};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyek-soa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    if(user.username!=username){
        res.status(404).send("Username Tidak Sesuai Dengan Token");
    }
    const conn = await getConnection();
    const check = await executeQuery(conn,`select*from user where username='${username}' && password='${user.password}'`);
    if(check.length==0){
        res.status(400).send("Akun tidak ditemukan");
    }else{
        const deleteUser = await executeQuery(conn,`delete from user where username='${username}' && password='${user.password}'`);
    }
    res.status(200).send("Berhasil delete akun "+ username);
});

//upgrade blm selesai
router.put("/upgrade", async(req,res)=>{
    const token = req.header("x-auth-token");
    console.log(token);
    let user ={};
    if(!token){
        res.status(401).send("Token not found");
    }
    try{
        user = jwt.verify(token,"proyek-soa");
    }catch(err){
        res.status(401).send("Token Invalid");
    }
    const conn = await getConnection();
    const check = await executeQuery(conn,`select*from user where username='${user.username}' && password='${user.password}'`);
    if(check.length>0){
        const update = await executeQuery(conn,`update user set type=1 where username='${user.username}'`)
        conn.release();
        res.status(200).send("Upgrade akun " + user.username + " berhasil");
    }else{
        conn.release();
        res.status(400).send("Akun tidak ditemukan");
    }
    
});

//get user by keyword
router.get("/:keyword",async(req,res)=>{
    const username = req.params.keyword;

    var users=[];

    if(!username){
        res.status(400).send("Keyword belum diinput");
    }else{
        const conn = await getConnection();
        const search = await executeQuery(conn,`SELECT * FROM user WHERE LOWER(username) LIKE  LOWER('%${username}%')`);
        if(search.length<=0){
            res.status(404).send("Akun tidak ditemukan");
        }else{
            search.forEach(result => {
                var user={
                    username:result.username,
                    password:result.password,
                    name:result.name,
                    phone_number:result.phone_number,
                    type:result.type,
                    profile_picture:result.profile_picture
                };
                users.push(user);
            });
            var obj={
                message:"Akun berhasil ditemukan",
                users:users
            }
            res.status(200).send(obj);
        }
    }
});

module.exports = router;