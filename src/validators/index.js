import { body } from "express-validator";

 const userRegistorValidator = ()=>{
    return [
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email"),

    body("username")
      .trim()
      .notEmpty().withMessage("Username is required")
      .isLength({ min: 3 }).withMessage("Username must be at least 3 characters"),
      

    body("password")
      .trim()
      .notEmpty().withMessage("Password is required"),
     
    body("fullName")
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ min: 2 })
      .withMessage("Full name must be at least 2 characters"),
  ];
}

 const loginUserValidator=()=>{
    return [
        body("email")
        .optional()
        .isEmail().withMessage("Enter valid email"),

       body("password")
      .trim()
      .notEmpty().withMessage("Password is required")
      

    ]
}
const userChangePasswordValidator=()=>{
  return [
    body("oldPassword").notEmpty().withMessage("old password is required"),
    body("newPassword").notEmpty().withMessage("new password is required")
  ]
}

const userForgotPasswordValidator=()=>{
  return [
    body("email").notEmpty().withMessage("email is required").isEmail().withMessage("Email is invalid")

  ]
}

const userResetForgotPasswordValidator = ()=>{
  return[
    body("newPassword").notEmpty().withMessage("Pleas enter new password")

  ]
}








export{
  userRegistorValidator,
  loginUserValidator,
  userChangePasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator
}