import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const emailSend = async (options)=>{
    const mailGenerator=new Mailgen({
        theme: "default",
        product:{
            name:"Project Manager",
            link:"https://projectmanager.com"
        }
    })


    const emailPlaintext = mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHtmltext = mailGenerator.generate(options.mailgenContent)

    const transportEmail = nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port:process.env.EMAIL_SMTP_PORT,
        auth:{
            user:process.env.EMAIL_SMTP_USER,
            pass:process.env.EMAIL_SMTP_PASSWORD
        }
    })

    const mail = {
        from:"porjectmanagerteam@example.com",
        to:options.email,
        subject: options.subject,
        html:emailHtmltext,
        text:emailPlaintext
    }
    try {
        await transportEmail.sendMail(mail)
    } catch (error) {
        console.error("Email Service failed,Make sure you provided mailtrap credentials in .env file")
        console.error("error", error)
    }
}

/*EMAIL_SMTP_HOST=sandbox.smtp.mailtrap.io
EMAIL_SMTP_PORT=2525
EMAIL_SMTP_USER=7663f701b55d9a
EMAIL_SMTP_PASSWORD=d663b2db238efd*/




const emailVerificationTemplate = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to Project Manager! We're excited to have you onboard.",
            action: {
                instructions: "Click the button below to verify your email:",
                button: {
                    color: "#22BC66",
                    text: "Verify Email",
                    link: verificationUrl
                }
            },
            outro: "Need help or have questions? Just reply to this email, we'd love to help."
        }
    }
}


const passwordResetTemplate = (username, resetPasswordUrl) => {
    return {
        body: {
            name: username,
            intro: "You requested a password reset for your account.",
            action: {
                instructions: "Click the button below to reset your password:",
                button: {
                    color: "#22BC66",
                    text: "Reset Your Password",
                    link: resetPasswordUrl
                }
            },
            outro: "If you did not request this, you can safely ignore this email."
        }
    }
}



export{
    emailVerificationTemplate,
    passwordResetTemplate,
    emailSend
}