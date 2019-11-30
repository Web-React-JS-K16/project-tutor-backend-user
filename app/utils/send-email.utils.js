require('dotenv').config()
const sendGrid = require('sendgrid').mail;
//TODO: setup env to save SendGridApiKey
// const sg = require('sendgrid')(process.env.SendGridApiKey);
const sg = require('sendgrid')('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');

/**
 * input: name, to: email, token
 */
exports.sendVerificationEmail = (name, to, token) => {
    // TODO: set up env to save host frontend
    // const hostUrl = process.env.frontendHostURL;
    const hostUrl = 'http://localhost:3000'
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
                    subject: "Kích hoạt tài khoản"
                }
            ],
            from: {
                email: "web.reactjs.group@gmail.com"
            },
            content: [
                {
                    type: 'text/plain',
                    value: `Chào ${name}. Mời bạn click vào link dưới đây để kích hoạt tài khoản: ${hostUrl}/verification?token=${token}&email=${to}`
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