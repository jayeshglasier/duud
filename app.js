require('dotenv').config();
const express = require("express");
const app = express();
require("./config/dbConn");
const apiRouter = require("./routes/api");
const webRouter = require("./routes/web");
const adminRouter = require("./routes/admin_api");
const path = require("path");
const response = require("./helper/response");
const fileUpload = require('express-fileupload');
const console = require("./helper/console");
const cors = require('cors');
const expressSession = require('express-session');

app.use(cors());

global.__basedir = __dirname;
global.__joiOptions = { errors: { wrap: { label: '' } } }; // remove double quotes in default massage field name

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressSession({secret: '465s4df654sf654sd646sdf64', saveUninitialized: true, resave: false})); //for session store

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static('./public'));

app.use(process.env.BASE_URL+'api', apiRouter);
app.use(process.env.BASE_URL, webRouter);
app.use(process.env.BASE_URL+'admin/api', adminRouter);

app.all('/api', (req,res) => {
	return res.send(response.error(404, 'API Request not found!', [] ));
})
app.all('/api/*', (req,res) => {
	return res.send(response.error(404, 'API Request not found!', [] ));
})
app.all('/*', (req,res) => {
	return res.render('errors/main',{ code: 404, errorMessage: 'The page you requested was not found!'})
})

app.listen(port, (error)=> {
	if(error) {
		console.error(error, __filename, "--");
		throw error
	}
	console.log(`connection is setup at ${port}`);
})