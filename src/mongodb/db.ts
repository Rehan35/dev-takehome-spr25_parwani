import mongoose from 'mongoose';

const MONGO_URI = `mongodb+srv://rehanparwani:${process.env.PASSWORD}@cluster0.2tjdq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGO_URI, {
                dbName: 'non-profit-database',
                autoIndex: true
            });
            console.log("MongoDB connected successfully.");
        }
    } catch (error) {
        console.error("MongoDB connection error: ", error);
        process.exit(1);
    }
}

export default connectDB;