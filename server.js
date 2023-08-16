const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const data = require("./data.json");
const cors = require('cors');
const fs = require('fs');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get("/", (req, res) => {
    res.json(data);
});
app.post('/product/add', (req, res) => {
    let sendedData = req.body;
    console.log(sendedData);
    console.log(data);
    data.products.push(sendedData);
    console.log(data.products);
    fs.writeFile('data.json', JSON.stringify(data), 'utf8', function (err) {
        if (err)
            res.send("Error");
    });
    res.send("Successfully");
});
app.post('/users/add', (req, res) => {
    let sendedData = req.body;
    data.users.push(sendedData);
    console.log(data.users);
    fs.writeFile('data.json', JSON.stringify(data), 'utf8', function (err) {
        if (err)
            res.send("Error");
    });
    res.send("Successfully");
});
app.get('/users', (req, res) => {
    res.json(data);
});
app.listen(PORT);
