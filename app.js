const express = require('express');
const bhs = require('express-handlebars');

const app = express();

app.use(express.static(__dirname + '/public'));

app.get('/terris', (req, res) => {
    res.sendFile(__dirname + '/public/terris/index.html');
});

const port = process.argv[2] || 3000;

app.listen(port, () => {
    console.log('started');
});