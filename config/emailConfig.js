const nodemailer = require('nodemailer');

const emailTransporterConfig = () => {
	return nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: process.env.MAIL_PORT,
		secure: false,
		requireTLS: true,
		auth: {
			user: process.env.MAIL_USERNAME,
			pass: process.env.MAIL_PASSWORD
		}
	});
};

module.exports = {
    emailTransporterConfig
};
