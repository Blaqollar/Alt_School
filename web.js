const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const port = 3002;

const server = express();

server.use(express.static('public'));

const HomepagePath = path.join(__dirname, 'public', 'index.html');
const NotFoundPagePath = path.join(__dirname, 'public', '404.html');

const handleHomepage = async (req, res) => {
  try {
    const file = await fs.readFile(HomepagePath);
    res.status(200).send(file);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
};

server.get('/index.html', handleHomepage);

server.get('*', async (req, res) => {
  try {
    const file = await fs.readFile(NotFoundPagePath);
    res.status(404).send(file);
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal Server Error');
  }
});

server.listen(port, () => console.log(`Listening on port: ${port}`));
