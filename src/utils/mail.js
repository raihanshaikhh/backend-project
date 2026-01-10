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




const emailVerificationTemplate = (username, verificationUrl)=>{
return{ 
    body: {
        name: username,
        intro: 'Welcome to project manager! we\'re  excited to have you onboard',
        action:{
            instructions: 'To get started with Mailgen, please click here:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Verify email',
                link: verificationUrl
        }

    }
},
outro:'Need help, or have questions? Just reply to this email, we\'d love to help.'
   
}
}

const passwordResetTemplate = (username, resetPasswordUrl)=>{
return{ 
    body: {
        name: username,
        intro: 'You have received this email because a password reset request for your account was received.',
        action:{
            instructions: 'Click the button below to reset your password:',
            button: {
                color: '#22BC66', // Optional action button color
                text: 'Reset Your Password Now',
                link: resetPasswordUrl
        }

    }
},
        outro: 'If you did not request a password reset, no further action is required on your part.'
   
}
}


export{
    emailVerificationTemplate,
    passwordResetTemplate,
    emailSend
}