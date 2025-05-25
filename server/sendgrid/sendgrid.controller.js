import sgMail from '@sendgrid/mail' 
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.SENDGRID_API_KEY
export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];
    const msg = {
        to: recipient, 
        from: {
            name: "The Carbon Credit System",
            email: process.env.SENDGRID_SENDER
        }, 
        templateId: process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID,
        dynamicTemplateData: {
            verification_token: verificationToken
        }}
        sgMail.setApiKey(apiKey)
        try {
            const response = await sgMail.send(msg);
            console.log("Verification email sent successfully:", response);
        } catch (error) {
            console.error("Error In Sending Verification Email:", error.response?.body || error);
            throw new Error("Failed to send verification email");
        }      
};

export const sendWelcomeEmail = async (email, fullname, username) => {
    const recipient = [{ email }];
    const msg = {
        to: recipient, 
        from: {
            name: "The Carbon Credit System",
            email: process.env.SENDGRID_SENDER
        },
        templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID,
        dynamicTemplateData: {
            sender_name: fullname,
            username: username
        }}
        sgMail.setApiKey(apiKey)
    try {
        const response = await sgMail.send(msg)
        console.log("Welcome email sent successfully:", response);    
    } catch (error) {
        console.error("Error In Sending Welcome Email:", error.response?.data || error);
        throw new Error("Failed to send welcome email");
    }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];
    const msg = {
        to: recipient, 
        from: {
            name: "The Carbon Credit System",
            email: process.env.SENDGRID_SENDER
        },
        templateId: process.env.SENDGRID_RESET_PASSWORD_TEMPLATE_ID,
        dynamicTemplateData: {
            pass_reset_link: resetURL
        }}

        sgMail.setApiKey(apiKey)
    try {
        const response = await sgMail.send(msg)
        console.log("Reset Password email sent successfully:", response);
    } catch (error) {
        console.error("Error In Sending Reset Password Email:", error.response?.data || error);
        throw new Error("Failed to send Reset Password email");
    }
}

export const sendPasswordResetSuccessEmail = async (email) => {
    const recipient = [{ email }];
    const msg = {
        to: recipient, 
        from: {
            name: "MarketFlux",
            email: process.env.SENDGRID_SENDER
        },
        templateId: process.env.SENDGRID_RESET_PASSWORD_SUCCESS_TEMPLATE_ID,
        }

        sgMail.setApiKey(apiKey)
    try {
        const response = await sgMail.send(msg)
        console.log("Password Reset Successful:", response);
    } catch (error) {
        console.error("Error In Sending Reset Password Confirmation Email:", error.response?.data || error);
        throw new Error("Failed to send Reset Password Confirmation email");
    }
}