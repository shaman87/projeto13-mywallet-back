import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
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

const signInSchema = joi.object({
    email: joi.string().empty(" ").email().required(), 
    password: joi.string().empty().required()
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
        db.collection("users").insertOne({
            name, 
            email, 
            password: hashPassword 
        });

    } catch(error) {
        console.error(error);
        return res.sendStatus(500);
    }

    res.sendStatus(201);
});

app.post("/sign-in", async (req, res) => {
    const { email, password } = req.body;
    const validation = signInSchema.validate({ email, password }, { abortEarly: false });

    if(validation.error) {
        const errorList = validation.error.details.map(error => error.message);
        return res.status(422).send(errorList);
    }

    try {
        const user = await db.collection("users").findOne({ email });
        console.log(user);
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if(user && passwordIsValid) {
            const token = uuid();

            await db.collection("sessions").deleteMany({ userId: user._id });
            await db.collection("sessions").insertOne({
                userId: user._id, 
                token
            });

            res.send(token);
        } else {
            return res.sendStatus(401);
        }

    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
});

app.listen(5000, () => console.log("Listening on port 5000"));