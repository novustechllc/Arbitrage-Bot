// Import necessary libraries
const express = require('express'); 
const path = require('path'); 
const http = require('http'); 
const cors = require('cors'); 

// SERVER CONFIG

// Define the port where the server will listen for incoming requests
const PORT = process.env.PORT || 5000;

// Create an instance of the Express application
const app = express();

// Create an HTTP server using the Express app and start listening on the specified port
const server = http.createServer(app).listen(PORT, () => console.log(`Listening on ${PORT}\n`));

// Serve static files (e.g., HTML, CSS, JavaScript) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS (Cross-Origin Resource Sharing) with specific configuration
app.use(cors({ credentials: true, origin: '*' }));
