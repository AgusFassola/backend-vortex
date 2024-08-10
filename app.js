//NODE MAILER
//npm install nodemailer
const transport = require('./helpers/mailer');

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



enviarMail = async () => {
    const result = await transport.sendMail({
        from : '"Maddison Foo Koch 👻" <agustin.fassola98@gmail.com>',
        to :'agusfassolacarp@gmail.com',
        subject : 'Correo de prueba',
        text : 'Correo desde node.js'
    });
    console.log({ result });
};

enviarMail();
