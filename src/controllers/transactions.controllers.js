import db from "../database/db.js";
import dayjs from "dayjs";
import { transactionSchema } from "../schemas/transactions.schemas.js";

async function createTransactions(req, res) {
    const { user } = res.locals;
    const { amount, description, type } = req.body;
    const validation = transactionSchema.validate({ amount, description, type }, { abortEarly: false } );

    if(validation.error) {
        const errorList = validation.error.details.map(error => error.message);
        return res.status(422).send(errorList);
    }

    try {
        await db.collection("transactions").insertOne({
            amount, 
            description, 
            type, 
            date: dayjs().format("DD/MM"), 
            userId: user._id
        });

        return res.sendStatus(200);

    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
};

async function getTransactions(req, res) {
    const { user } = res.locals;
    
    try {
        const transactionsList = await db.collection("transactions").find({ userId: user._id }).toArray();
        return res.status(200).send(transactionsList);

    } catch(error) {
        console.error(error);
        return res.status(500).send(error.message);
    }
};

export { createTransactions, getTransactions };