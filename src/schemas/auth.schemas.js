import joi from "joi";

const signUpSchema = joi.object({
    name: joi.string().empty(" ").required(), 
    email: joi.string().empty(" ").email().required(),
    password: joi.string().empty(" ").required(), 
    confirmPassword: joi.ref("password")
});

const signInSchema = joi.object({
    email: joi.string().empty(" ").email().required(), 
    password: joi.string().empty(" ").required()
});

export { signUpSchema, signInSchema };