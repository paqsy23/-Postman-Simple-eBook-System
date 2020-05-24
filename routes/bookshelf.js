const express = require("express"), mysql = require("mysql"), request = require("request");
const parseString = require("xml2js").parseString;
const config = require("../config");
const router = express.Router();
const conn = mysql.createConnection(config.database);

function getBook(id) {
    return new Promise((resolve, reject) => {
        const options = {
            method: "GET",
            url: `https://www.goodreads.com/book/show/${id}.xml?key=P1vzTR40liY9SzWSOOlSA`,
            headers: { 'Content-Type': "application/x-www-form-urlencoded" }
        }
        request(options, (error, response) => {
            if (error) reject(new Error(error));
            else {
                resolve(response.body);
            }
        })
    });
}

//Insert book to bookshelf
router.post("/insert", async (req, res) => {
    const book = await getBook(50);
    res.send(book);
});

//Show user's bookshelf
router.get("/", (req, res) => {

});

//Search user's bookshelf
router.get("/search/:username", (req, res) => {

});

//Change bookshelf privacy (Premium User)
router.put("/changePrivacy", (req, res) => {

});

//Delete book from bookshelf
router.delete("/delete", (req, res) => {

});

module.exports = router;