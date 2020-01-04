require('dotenv').config()
const sendGrid = require('sendgrid').mail;
// //TODO: setup env to save SendGridApiKey
// // const sg = require('sendgrid')(process.env.SendGridApiKey);
// const sg = require('sendgrid')('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');
// // const hostUrl = 'http://localhost:3000';
const hostUrl = 'https://tutor-front-end-user.herokuapp.com';

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'web.reactjs.group@gmail.com',
        pass: '1234567ab'
    }
});



const sendEmail = (to, subject, contentEmail) => {
    const mailOptions = {
        from: 'web.reactjs.group@gmail.com', // sender address
        to, // list of receivers
        subject,// Subject line
        html: contentEmail// plain text body
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}

// const sendEmail = (to, subject, contentEmail) => {
//     // TODO: set up env to save host frontend
//     // const hostUrl = process.env.frontendHostURL;
//     const request = sg.emptyRequest({
//         method: "POST",
//         path: "/v3/mail/send",
//         body: {
//             personalizations: [
//                 {
//                     to: [
//                         {
//                             email: to
//                         }
//                     ],
//                     subject
//                 }
//             ],
//             from: {
//                 email: "web.reactjs.group@gmail.com"
//             },
//             content: [
//                 {
//                     type: 'text/plain',
//                     value: contentEmail
//                 }
//             ]
//         }
//     });
//     return new Promise(function (resolve, reject) {
//         sg.API(request, function (error, response) {
//             if (error) {
//                 return reject(error);
//             }
//             else {
//                 return resolve(response);
//             }
//         });
//     });
// };

/**
 * input: name, to: email, token
 */
exports.sendVerificationEmail = (name, to, token) => {
    const subject = "Kích hoạt tài khoản";
    const content = `Chào ${name}, mời bạn click vào link dưới đây để kích hoạt tài khoản: ${hostUrl}/active-email/${token}/${to}`;
    sendEmail(to, subject, content);
    // console.log("after send email: ", content);
};

/**
 * input: to: email, token
 */
exports.sendResetPasswordEmail = (name, to, token) => {
    const subject = "Lấy lại mật khẩu";
    const content = `Chào ${name}, mời bạn click vào link dưới đây để thay đổi mật khẩu: ${hostUrl}/reset-password/${token}/${to}`;
    sendEmail(to, subject, content);
};