/**
 *  @author XHI-NM <jeong.chiseo@tsp-xr.com>
 *  @description
 *  Multi Purpose Server for Web using Node.js
 */

//=================================================================
// Import or Set Function from Node.js Packages
//=================================================================

const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");


// File Server Configuration
const path = require('path');



//=================================================================
// Set Server Configuration
//=================================================================

const HTTP_PORT = 8080;
const HTTPS_PORT = 5555;

const options = {
    key: fs.readFileSync("./ssl/_wildcard_.tsp-xr.com_key.pem"),
    cert: fs.readFileSync("./ssl/_wildcard_.tsp-xr.com_.crt.pem"),
    passphrase: "",
    requestCert: false,
    rejectUnauthorized: false
};

app.use(express.json({ limit: '10mb' })); 

app.post('/save-image', (req, res) => {
    const imageData = req.body.imageData;
    if (!imageData) {
        return res.status(400).send({ error: 'Image data is missing' });
    }
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    
    const savePath = path.join(__dirname, 'saved_images', `${Date.now()}.png`);
    fs.writeFile(savePath, base64Data, 'base64', err => {
        if (err) {
            console.error("Error saving image:", err);
            return res.status(500).send({ error: 'Failed to save image' });
        }
        console.log(`Image saved at ${savePath}`);
        res.send({ message: 'Image saved successfully' });
    });
});

//=================================================================
// Function & Class
//=================================================================

function setServerOption(app) {
    app.set("view engine", "ejs");
    app.engine("html", require("ejs").renderFile);

    app.use(cors());

    app.use((req, res, next) => {
        res.header("Cross-Origin-Opener-Policy", "same-origin");
        res.header("Cross-Origin-Embedder-Policy", "credentialless");
        next();
    });

    app.use("/", express.static(`${__dirname}/../web/`));
    app.use("/assets", express.static(`${__dirname}/../web/assets`));
    app.use("/styles", express.static(`${__dirname}/../web/styles`));
    app.use("/modules", express.static(`${__dirname}/../web/modules`));
}

function setHttpsRedirection(app) {
    app.use((req, res, next) => {
        if (!req.secure) {
            res.redirect(`https://${req.headers.host + req.url}`);
        }
        else {
            next();
        }
    });
}

function startServer() {
    setServerOption(app);
    // setHttpsRedirection(app);

    const httpServer = require("http").createServer({}, app);
    const httpsServer = require("https").createServer(options, app);

    httpServer.listen(HTTP_PORT, () => {
        console.log("\n==========================================");
        console.log("Web Server for Image Tracking");
        console.log("==========================================");
        console.log("");
        console.log("### Express server listening on port");
        console.log("");
        console.log(`- Network: http://${httpServer.address().address}:${httpServer.address().port}`);
    });

    httpsServer.listen(HTTPS_PORT, () => {
        console.log(`- Network: https://${httpsServer.address().address}:${httpsServer.address().port}\n`);
    });
}

startServer();