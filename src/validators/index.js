import { body } from "express-validator";

export const userRegistorValidator = ()=>{
    return[
        body("email")
        .trim()
        .notEmpty()
        .withMessage("this field cannot be empty")
        .isEmail()
        .withMessage("please enter a valid email"),
        body("username")
        .trim()
        .notEmpty()
        .withMessage("username is required")
        .isLowercase()
        .withMessage("username should be in lowercase")
        .length({min:3})
        .withMessage("username must be atleast three characters long"),
        body("password")
        .trim()
        .notEmpty()
        .withMessage("password is required")
        .isAlphanumeric(),
        body("fullName")
        .trim()
        .optional()
        
    ]
}