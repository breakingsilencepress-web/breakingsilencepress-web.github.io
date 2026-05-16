const express = require('express');
const mongoose = require('mongoose');
const Subscriber = require('./models/subscribers.js')
const Evidence = require('./models/evidence.js')
const joi = require('joi');
const cors = require('cors');
const { error } = require('node:console');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const EmailLog = require('./models/emailLog.js');
require('dotenv').config();
const subscriberSchema = joi.object({
    email: joi.string().email().required()
});
const evidenceSchema = joi.object({
    qrCode: joi.string().required(),
    chapter: joi.string().required(),
    heading: joi.string().required(),
    date: joi.date().required(),
    description: joi.string().required().min(5),
    downloadUrl: joi.string().required(),
    readUrl: joi.string().required(),
    source: joi.string().required(),
    fileType: joi.string().required(),
    copyRightStatus: joi.string().required(),
    downloadDate: joi.date().required(),
    originalUrl: joi.string().required(),
    moreDescription: joi.string().required(),
    relevance: joi.string().required()
});
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);


const app = express();
app.use(express.json());
app.use(cors({
    origin: ['https://breakingsilencepress-web.github.io', 'http://localhost:5500', 'http://127.0.0.1:5500']
}));
app.set('trust proxy', 1);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Too many requests, please try again later." }
});

function checkAuth(req, res, next){
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({ error: "Unauthorized" });
    }
    if(!header.startsWith("Bearer ")){
        return res.status(401).json({ error: "Unauthorized" });
    }
    try{
        const token = header.split(" ")[1];
        if(token === process.env.ADMIN_TOKEN){
            next();
        } else{
            return res.status(401).json({ error: "Unauthorized" });
        }
    }catch(err){
        return res.status(401).json({ error: "Unauthorized" });
    }
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.PORT);
        console.log(`Listening on port ${process.env.PORT}...`);}
    )
    .catch((err) => { console.log(`Failed to connect! Error: ${err}`) })


app.get('/subscribers', checkAuth, async (req, res, next) => {
    try{
        const subscribers = await Subscriber.find();
        res.status(200).json({subscribers});
    } catch(err){
        next(err);
    }
});

app.post('/send-email', checkAuth, async (req, res, next) => {
    try {
        const { subject, message } = req.body;
        const subscribers = await Subscriber.find({ verified: true });
        if(!subject || !message){
            return res.status(400).json({ error: "Subject and message are required!" });
        }
        for(const subscriber of subscribers){
            await resend.emails.send({
                from: 'BreakingSilence Press <onboarding@resend.dev>',
                to: subscriber.email,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <p>${message}</p>
                        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #888;">
                            You're receiving this because you subscribed to BreakingSilence Press.<br>
                            <a href="${process.env.BACKEND_URL}/unsubscribe/${subscriber._id}" style="color: #888;">Unsubscribe</a>
                        </p>
                    </div>
                `
            })
        };
        await EmailLog.create({
            subject: subject,
            message: message,
            recipients: subscribers.length
        });
        res.status(200).json({ message: "Emails sent!" });
    } catch(err) {
        next(err);
    }
});

app.get('/evidences-public', async (req, res, next) => {
    try {
        const evidences = await Evidence.find();
        res.status(200).json({ evidences });
    } catch(err) {
        next(err);
    }
});

app.get('/evidences', checkAuth, async (req, res, next) => {
    try{
        const evidences = await Evidence.find();
        res.status(200).json({evidences});
    } catch(err){
        next(err);
    }
});

app.get('/download', async (req, res, next) => {
    try {
        const { url, filename } = req.query;
        if (!url) return res.status(400).json({ error: "URL is required" });

        const name = (filename || url.split('/').pop() || 'download.pdf').replace(/[^\w\s.\-]/g, '_').trim();

        const fetchRes = await fetch(url);
        if (!fetchRes.ok) return res.status(502).json({ error: "Failed to fetch file" });

        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'application/octet-stream');

        const { Readable } = require('stream');
        Readable.fromWeb(fetchRes.body).pipe(res);
    } catch(err) {
        next(err);
    }
});

app.get('/verify/:token', async (req, res, next) => {
    try{
        const token = req.params.token;
        const verifiedSubscriber = await Subscriber.findOne({ verificationToken: token });
        if(!verifiedSubscriber){
            return res.status(404).json({ error: "Invalid token" });
            res.redirect(`${process.env.FRONTEND_URL}/404.html`);
        }
        verifiedSubscriber.verified = true;
        verifiedSubscriber.verificationToken = undefined;
        await verifiedSubscriber.save();
        res.redirect(`${process.env.FRONTEND_URL}/verified.html`);
    } catch(err){
        next(err);
    }
});

app.get('/email-logs', checkAuth, async (req, res, next) => {
    try {
        const logs = await EmailLog.find().sort({ sentAt: -1 });
        res.status(200).json({ logs });
    } catch(err) {
        next(err);
    }
});

app.post("/subscribe", limiter,  async (req, res, next) => {
    try{
        const token = crypto.randomBytes(32).toString('hex');
        const result = subscriberSchema.validate(req.body);
        if(result.error){
            return res.status(400).json({ error: `Invalid email! Error: ${result.error.message}` });
        }
        const subscriber = new Subscriber(req.body);
        subscriber.verificationToken = token;
        subscriber.verified = true; // add this line
        await subscriber.save();
        resend.emails.send({
            from: 'BreakingSilence Press <onboarding@resend.dev>',
            to: subscriber.email,
            subject: "Verify your email",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2>Confirm your subscription</h2>
                    <p>Thanks for subscribing to BreakingSilence Press. Click the button below to verify your email.</p>
                    <a href="${process.env.BACKEND_URL}/verify/${token}"
                    style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Verify Email
                    </a>
                    <p style="margin-top: 20px; color: #888; font-size: 12px;">If you didn't subscribe, ignore this email.</p>
                </div>
            `
        });
        res.status(201).json({ message: "Check your email to verify your subscription!" });
    } catch(err){
        next(err);
    }
});

app.post('/evidence', checkAuth, async (req, res, next) => {
    try{
        const result = evidenceSchema.validate(req.body);
        if(result.error){
            return res.status(400).json({ error: `Invalid evidence data! Error: ${result.error.message}` });
        }
        const alrExists = await Evidence.findOne({ heading: req.body.heading });
        if(alrExists){
            return res.status(409).json({ error: 'Card already exits!' });
        }
        const evidence = new Evidence(req.body);
        await evidence.save();
        res.status(201).json({ message: "Evidence Saved!" })
    } catch(err){
        next(err);
    }
});

app.delete('/subscriber/:id', checkAuth, async (req, res, next) => {
    try{
        const deletedSubscriber = await Subscriber.findByIdAndDelete(req.params.id);
        res.status(200).json({deletedSubscriber});
    } catch(err){
        next(err);
    }
});

app.get('/unsubscribe/:id', async (req, res, next) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.redirect(`${process.env.FRONTEND_URL}/unsubscribed.html`);
    } catch(err) {
        next(err);
    }
});

app.delete('/evidence/:id', checkAuth, async (req, res, next) => {
    try{
        const deletedEvidence = await Evidence.findByIdAndDelete(req.params.id);
        if(!deletedEvidence){
            return res.status(404).json({ error: "Evidence not found" });
        }
        res.status(200).json({deletedEvidence});
    } catch(err){
        next(err);
    }
});

app.post('/adminlogin', async (req, res, next) => {
    try{
        const {token, password} = req.body;
        if(!token || !password){
            return res.status(400).json({ error: "Email or password is required!" });
        }
        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
        if(token === process.env.ADMIN_TOKEN && isMatch){
            res.status(200).json({ message: "Admin signed in" })
        } else {
            return res.status(401).json({ error: "Unauthorized" });
        }
    } catch(err){
        next(err);
    }
});

app.put('/evidence/:id', checkAuth, async (req, res, next) => {
    try{
        const result = evidenceSchema.validate(req.body);
        if(result.error){
            return res.status(400).json({ error: `Invalid evidence data! Error: ${result.error.message}` });
        }
        await Evidence.findByIdAndUpdate(req.params.id, req.body);
        res.status(201).json({ message: "Evidence Updated!" })
    } catch(err){
        next(err);
    }
});

app.use((err, req, res, next) => {
    if(err.code === 11000){
        return res.status(409).json({ error: "Email already registered!" })
    }
    res.status(500).json({ error: `Internal Server Error: ${err}` })
})
