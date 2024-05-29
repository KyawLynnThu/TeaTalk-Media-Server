const express = require('express')
const app = express()
const port = 3001
const dotenv = require('dotenv');
var cors = require('cors')
dotenv.config();
const routers = require('./app/routes/index')
const corsOptions = {
  origin: "*"
}
app.use(cors(corsOptions));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/api', routers);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})