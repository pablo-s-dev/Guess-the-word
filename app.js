const express = require('express');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, '')));
// const port = process.env.PORT || 8080;
const port = 8090;

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(`${__dirname}/index.html`);
  console.log(`${__dirname}/index.html`)
});

app.listen(port);
