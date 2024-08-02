const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const http = require('http');

//Import routes
const authRoutes = require('./router/auth');
const userRoutes = require('./router/user');
const adminRoutes = require('./router/admin');
const withToken = require('./router/publicAccess');

//Importing middlewares
const {verifyToken, isBuyer} = require('./middleware/verifyToken');

//Importing socket.io
const {setupSocket, setupSocketPrivate} = require('./service/chatingService');

dotenv.config();
const app = express();
const server = http.createServer(app);
// setupSocket(server);

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

//Creating uplaods directory and serving it as static.
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

//using routes without token
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/public', withToken);

//using middleware
app.use(verifyToken);

//can't use routes with token.
app.use('/user', userRoutes);



// Database connection
const dbURI = process.env.MONGO_URI;
const PORT = process.env.PORT;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true,}).then(() => {
    console.log('Connected to the database');
    // app.listen(PORT, () => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});