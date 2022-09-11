import db from "../database/db.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { signUpSchema, signInSchema } from "../schemas/auth.schemas.js";

async function signUp(req, res) {
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
};

async function signIn(req, res) {
    const { email, password } = req.body;
    const validation = signInSchema.validate({ email, password }, { abortEarly: false });

    if(validation.error) {
        const errorList = validation.error.details.map(error => error.message);
        return res.status(422).send(errorList);
    }

    try {
        const user = await db.collection("users").findOne({ email });    
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
};

async function signOut(req, res) {
    const { user } = res.locals;

    try {
        await db.collection("sessions").deleteOne({ userId: user._id });
        return res.sendStatus(200);

    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
};

export { signUp, signIn, signOut };