const mongoose = require('mongoose');
require('dotenv').config();
const MONGO_URL = process.env.MONGO_URL
const express = require('express')
const app = express()
const PORT = 5000
const userRoutes = require('./routes/userRoute')

app.use(express.json())
app.use('/api', userRoutes)


mongoose.connect(MONGO_URL)
.then(() => {
  console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
  console.error('Error connecting to MongoDB Atlas', err);
});

app.listen(PORT,()=>{
    console.log(`Server is running at port ${PORT}`);
    
})