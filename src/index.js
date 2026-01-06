import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/mongodb-connection.js';



dotenv.config({
    path: './.env'
});


const PORT = process.env.PORT || 3000;

// connect to database
connectDB()
.then(()=>{
    app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
})
.catch((err)=>{
    console.log("Mongo db connection failed", err);
    process.exit(1);
    
})
