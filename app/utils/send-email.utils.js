require('dotenv').config()
const sendGrid = require('sendgrid').mail;
//TODO: setup env to save SendGridApiKey
// const sg = require('sendgrid')(process.env.SendGridApiKey);
const sg = require('sendgrid')('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');
const hostUrl = 'http://localhost:3000';


const sendEmail = (to, subject, contentEmail) => {
    // TODO: set up env to save host frontend
    // const hostUrl = process.env.frontendHostURL;
    const request = sg.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: {
            personalizations: [
                {
                    to: [
                        {
                            email: to
                        }
                    ],
                    subject
                }
            ],
            from: {
                email: "web.reactjs.group@gmail.com"
            },
            content: [
                {
                    type: 'text/plain',
                    value: contentEmail
                }
            ]
        }
    });
    return new Promise(function (resolve, reject) {
        sg.API(request, function (error, response) {
            if (error) {
                return reject(error);
            }
            else {
                return resolve(response);
            }
        });
    });
};

/**
 * input: name, to: email, token
 */
exports.sendVerificationEmail = (name, to, token) => {
    const subject = "Kích hoạt tài khoản";
    const content = `Chào ${name}, mời bạn click vào link dưới đây để kích hoạt tài khoản: ${hostUrl}/active-email/${token}/${to}`;
    sendEmail(to, subject, content);
};

/**
 * input: to: email, token
 */
exports.sendResetPasswordEmail = (name, to, token) => {
    const subject = "Lấy lại mật khẩu";
    const content = `Chào ${name}, mời bạn click vào link dưới đây để thay đổi mật khẩu: ${hostUrl}/reset-password/${token}/${to}`;
    sendEmail(to, subject, content);
};