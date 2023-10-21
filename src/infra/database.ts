import mongoose from "mongoose";

export async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/heroticket');

        console.log('Database connected successfully');

    } catch (error) {
        console.log("🚀 ~ file: database.ts:5 ~ connect ~ error:", error)
    }
}