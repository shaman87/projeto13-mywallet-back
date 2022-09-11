import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

try {
    await mongoClient.connect();
} catch(error) {
    console.error(error);
}

const db = mongoClient.db("my-wallet");

export default db;