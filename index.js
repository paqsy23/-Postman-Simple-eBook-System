const express = require('express');
const app = express();

app.use(express.urlencoded({extended:true}));
app.use("/bookshelf", require("./routes/bookshelf"));

app.listen(3000, () => {
    console.log("Listening on port 3000...");
});