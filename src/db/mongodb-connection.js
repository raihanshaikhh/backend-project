import mongoose  from "mongoose";

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("✅ Mongodb connected");
        
    } catch (error) {
        console.error("❌ Mongodb error")
        process.exit(1);
    }
}
export default connectDB;