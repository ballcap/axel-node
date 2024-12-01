const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' }); // Files will be saved in the 'uploads' directory

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Configure Nodemailer for Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'aalikhan1988@gmail.com',
        pass: 'lpza hgiw axyw kmph', // Replace with your app-specific password
    },
});

// Handle file uploads and email sending
app.post('/send-email', upload.single('input-img-attach'), async (req, res) => {
    const { file } = req;
    const userEmail = req.body['input-email']; // Get the email input from the form

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Fetch a random fortune from the API
        const response = await axios.get('https://mocki.io/v1/4bb967b2-9e27-4784-a473-c61d65055c3b');
        if (!Array.isArray(response.data) || response.data.length === 0) {
            throw new Error('Invalid fortune data from the API');
        }

        // Pick a random fortune
        const randomFortune = response.data[Math.floor(Math.random() * response.data.length)].message;

        // Configure the email
        const mailOptions = {
            from: 'your-email@gmail.com', // Replace with your email
            to: 'ko_seisaku@yahoo.co.jp', // Replace with the recipient's email
            subject: '画像がアップロードされました',
            text: `このメールアドレスから画像を受け取りました: ${userEmail}\n\n運勢: ${randomFortune}`,
            attachments: [
                {
                    filename: file.originalname,
                    path: file.path,
                },
            ],
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            // Delete the file after sending email
            fs.unlink(file.path, (err) => {
                if (err) console.error('Failed to delete file:', err);
            });

            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).send('Failed to send email.');
            }

            res.send(`
            <!DOCTYPE html>
            <html lang="ja">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="stylesheet" href="https://axel-test.onrender.com/style.css">
                <title>送信結果</title>
            </head>
            <body>
                <nav>
                    <a href="/">Home</a>
                </nav>
                <section>
                    <h1>結果</h1>
                    <p>正常に送信されました。２４時間以内に結果が送られてきますので、しばらくお待ちください。</p>
                    <p><strong>あなたの運勢:</strong> ${randomFortune}</p>
                    <a href="https://axel-test.onrender.com/">ホームに戻る</a>
                </section>
                <footer>
                    <p>&copy; MAKI Productions 2025</p>
                </footer>
            </body>
            </html>
            `);
        });
    } catch (error) {
        console.error('Error fetching fortune or sending email:', error);
        res.status(500).send('Failed to process your request.');
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
