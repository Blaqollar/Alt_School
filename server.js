const app = require('./api/api');
const port = process.env.PORT || 3002;

app.listen(port, () => console.log(`Listening on port: ${port}`));

