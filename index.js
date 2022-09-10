import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect().then(() => {
    db = mongoClient.db("my-wallet");
});

const signUpSchema = joi.object({
    name: joi.string().empty(" ").required(), 
    email: joi.string().empty(" ").email().required(),
    password: joi.string().empty(" ").required(), 
    confirmPassword: joi.ref("password")
});

app.post("/sign-up", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    const validation = signUpSchema.validate({ name, email, password, confirmPassword }, { abortEarly: false });

    if(validation.error) {
        const errorList = validation.error.details.map(error => error.message);
        return res.status(422).send(errorList);
    }

    const checkUserEmail = await db.collection("users").findOne({ email });

    if(checkUserEmail) {
        return res.status(409).send({ message: "E-mail already registered!" });
    }

    const hashPassword = bcrypt.hashSync(password, 10);

    try {
        db.collection("users").insertOne({ name, email, password: hashPassword });
    } catch(error) {
        console.error(error);
        return res.sendStatus(500);
    }

    res.sendStatus(201);
});

app.listen(5000, () => console.log("Listening on port 5000"));