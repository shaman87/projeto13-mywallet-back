import joi from "joi";

const transactionSchema = joi.object({
    amount: joi.number().precision(2).required(), 
    description: joi.string().empty(" ").required(), 
    type: joi.string().valid("credit", "debit").required()
});

export { transactionSchema };