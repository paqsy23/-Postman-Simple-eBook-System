const express = require("express"), mysql = require("mysql"), request = require("request"), xml2js = require("xml2js"), jwt = require("jsonwebtoken");
const parser = new xml2js.Parser();
const config = require("../config");
const router = express.Router();
const conn = mysql.createConnection(config.database);

function getBook(id_book){
    return new Promise(function (resolve,reject){
        var options = {
            'method':'GET',
            'url':`https://www.goodreads.com/book/show.xml?key=hhVpTAfyhwEbJ13DccFxTw&id=${id_book}`,
            'headers':{
                'Content-Type':'application/x-www-form-urlencoded'
            }
        };
        request(options,function(error,response){
            if(error) reject(new Error(error));
            else {
                var res;
                parser.parseString(response.body,(err, result)=>{
                    res=result;
                });
                resolve(res);
            }
        });
    });
}

function executeQuery(query) {
    return new Promise((resolve, reject) => {
        conn.query(query, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}

//Create new playlist
router.post("/create", async (req, res) => {
    var name = req.body.name;
    if (!name || name == '') {
        res.status(400).send("Fill all of the available fields");
    } else {
        const token = req.header("x-auth-token");
        let user = {};
        if (!token || token == '') return res.status(401).send("Token not found");
        try {
            user = jwt.verify(token, "proyek-soa");
        } catch (error) {
            return res.status(401).send("Token invalid");
        }
        const totalPlaylist = await executeQuery(`select * from h_playlist where username='${user.username}'`);
        if (user.type == 0 && totalPlaylist.length >= 2) {
            res.status(400).send("You already have 2 playlist, please upgrade your account");
        } else {
            var id = "PL";
            var num = await executeQuery('select max(substr(id_playlist,3)) as num from h_playlist');
            if (num[0].num == null) id += "001";
            else id += (parseInt(num[0].num) + 1).toString().padStart(3, '0');
            const insert = await executeQuery(`insert into h_playlist values('${id}', '${user.username}', '${name}', 0)`);
            res.status(200).send('New playlist created!');
        }
    }
});

//Insert book to playlist
router.post("/insert", async (req, res) => {
    var playlist_id = req.body.playlist_id, book_id = req.body.book_id;
    if (!playlist_id || playlist_id == '' || !book_id || book_id == '') {
        res.status(400).send("Fill all of the available fields");
    } else {
        const token = req.header("x-auth-token");
        let user = {};
        if (!token || token == '') return res.status(401).send("Token not found");
        try {
            user = jwt.verify(token, "proyek-soa");
        } catch (error) {
            return res.status(401).send("Token invalid");
        }
        const playlist = await executeQuery(`select * from h_playlist where id_playlist='${playlist_id}'`);
        if (playlist.length > 0) {
            const checkPlaylist = await executeQuery(`select * from h_playlist where id_playlist='${playlist_id}' and username='${user.username}'`);
            if (checkPlaylist.length > 0) {
                const book = await getBook(book_id);
                if (book.error == null) {
                    const checkBook = await executeQuery(`select * from d_playlist where id_playlist='${playlist_id}' and id_book=${book_id}`);
                    if (checkBook.length == 0) {
                        const insert = await executeQuery(`insert into d_playlist values('${playlist_id}', ${book_id})`);
                        res.status(200).send(`Success insert book with id ${book_id} to your playlist`);
                    } else res.status(400).send("This book has already in your playlist");
                } else res.status(404).send("Book not found!");
            } else res.status(400).send("You're not allowed to access this playlist");
        } else res.status(404).send("Playlist not found!");
    }
});

//Show all user's playlist
router.get("/", async (req, res) => {
    const token = req.header("x-auth-token");
    let user = {};
    if (!token || token == '') return res.status(401).send("Token not found");
    try {
        user = jwt.verify(token, "proyek-soa");
    } catch (error) {
        return res.status(401).send("Token invalid");
    }
    const h_playlist = await executeQuery(`select * from h_playlist where username='${user.username}'`);
    if (h_playlist.length > 0) {
        const data_hplaylist = await Promise.all(
            h_playlist.map(async (e1) => {
                const d_playlist = await executeQuery(`select * from d_playlist where id_playlist='${e1.id_playlist}'`);
                const data_dplaylist = await Promise.all(
                    d_playlist.map(async (e2) => {
                        const book = await getBook(e2.id_book);
                        const temp2 = {
                            id:e2.id_book,
                            title:book.GoodreadsResponse.book[0].title[0],
                            publication_year:book.GoodreadsResponse.book[0].publication_year[0],
                            publisher:book.GoodreadsResponse.book[0].publisher[0]
                        }
                        return temp2;
                    })
                );
                const temp1 = {
                    name:e1.name,
                    books:data_dplaylist
                }
                return temp1;
            })
        );
        res.status(200).send(data_hplaylist);
    } else res.status(200).send("Your playlist is empty");
});

//Search all playlist by username
router.get("/search/user/:username", async (req, res) => {
    var username = req.params.username;
    if (!username || username == '') {
        res.status(400).send("Fill all of the available fields");
    } else {
        const h_playlist = await executeQuery(`select * from h_playlist where username='${username}' and type=0`);
        if (h_playlist.length > 0) {
            const data_hplaylist = await Promise.all(
                h_playlist.map(async (e1) => {
                    const d_playlist = await executeQuery(`select * from d_playlist where id_playlist='${e1.id_playlist}'`);
                    const data_dplaylist = await Promise.all(
                        d_playlist.map(async (e2) => {
                            const book = await getBook(e2.id_book);
                            const temp2 = {
                                id:e2.id_book,
                                title:book.GoodreadsResponse.book[0].title[0],
                                publication_year:book.GoodreadsResponse.book[0].publication_year[0],
                                publisher:book.GoodreadsResponse.book[0].publisher[0]
                            }
                            return temp2;
                        })
                    );
                    const temp1 = {
                        name:e1.name,
                        books:data_dplaylist
                    }
                    return temp1;
                })
            );
            res.status(200).send(data_hplaylist);
        } else res.status(200).send("His/her doesn't has playlist");
    }
});

//Search all playlist by name
router.get("/search/name/:name", async (req, res) => {

});

//Change name of playlist
router.put("/changeName", async (req, res) => {

});

//Change playlist privacy
router.put("/changePrivacy", async (req, res) => {

});

//Remove book from playlist
router.delete("/delete/book/:book_id", async (req, res) => {

});

//Remove playlist
router.delete("/delete", async (req, res) => {

});

module.exports = router;