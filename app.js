const mongoose = require('mongoose');
const express = require('express');
const authRoutes = require('./routes/auth');

const app = express();

app.use('/api/auth', authRoutes );

const url = 'mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.q0ebaqb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(url) 
.then(() => {
    console.log('conexion correcta');
    app.listen(5000);
    
}).catch((error) => {
    console.log('falló la conexión!',error);
});


//NODE MAILER
//npm install nodemailer
//const transport = require('./helpers/mailer');

/* app.post("/api/auth/login/:email/code", async (req, res) => {
    const result = await transport.sendMail({
        from :     '"Maddison Foo Koch 👻" <agustin.fassola98@gmail.com>',
        to :'agusfassolacarp@gmail.com',
        subject : 'Correo de prueba',
        text : 'Correo desde node.js'
    });
    console.log({ result });
    res.status(200).json({ ok: true, message: "correo enviado con exito!"});
}); */


/* 
enviarMail = async () => {
    const result = await transport.sendMail({
        from : '"Agustin Fassola" <agustin.fassola98@gmail.com>',
        to :'agustin.fassola98@gmail.com',
        subject : 'Correo de prueba',
        text : 'Correo desde node.js'
    });
    console.log({ result });
};

enviarMail();
 */