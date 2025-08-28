require("dotenv").config()
const express = require("express")
const mysql = require("mysql2/promise")
const path = require("path")
const cors = require('cors');

const app = express()
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// // Middleware to parse URL-encoded bodies (from HTML forms) and JSON bodies
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Serve static files from the 'Front-end' directory
// This makes files like admin.html and js/script.js accessible
//server
app.use(express.static(path.join(__dirname, "Front-end")))

// Create connection pool with better error handling
let connection
async function connectToDatabase() {
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        })
        console.log("Connected to MySQL successfully!")
    } catch (err) {
        console.error("Error connecting to MySQL:", err)
        // Exit the process or handle the error appropriately
        process.exit(1)
    }
}

// Call the connection function
connectToDatabase()

// Route to serve the admin.html file
// Since 'Front-end' is now the static root, admin.html is directly accessible at /admin.html
// We can keep this specific route if you prefer /admin over /admin.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "Front-end", "admin.html"))
})

// Route to install/create tables
app.get("/install", async (req, res) => {
    let message = "Tables Created Successfully"
    const errors = []

    const queries = [
        `CREATE TABLE IF NOT EXISTS Products(
            product_id INT AUTO_INCREMENT,
            product_url VARCHAR(255) NOT NULL,
            product_name VARCHAR(255) NOT NULL,
            PRIMARY KEY (product_id)
        )`,
        `CREATE TABLE IF NOT EXISTS Users(
            user_id INT AUTO_INCREMENT,
            user_name VARCHAR(255) NOT NULL UNIQUE,
            user_password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id)
        )`,
        `CREATE TABLE IF NOT EXISTS ProductDescription(
            description_id INT AUTO_INCREMENT,
            product_id INT NOT NULL,
            product_brief_description VARCHAR(255) NOT NULL,
            product_description TEXT NOT NULL,
            product_img VARCHAR(255) NOT NULL,
            product_link VARCHAR(255) NOT NULL,
            PRIMARY KEY (description_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS ProductPrice(
            price_id INT AUTO_INCREMENT,
            product_id INT NOT NULL,
            starting_price DECIMAL(10,2) NOT NULL,
            price_range VARCHAR(255) NOT NULL,
            PRIMARY KEY (price_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE
        )`,
        `CREATE TABLE IF NOT EXISTS Orders(
            order_id INT AUTO_INCREMENT,
            product_id INT NOT NULL,
            user_id INT NOT NULL,
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'pending',
            PRIMARY KEY (order_id),
            FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
        )`,
    ]

    for (const query of queries) {
        try {
            await connection.query(query)
            console.log(`Table created/verified successfully: ${query.split(" ")[5]}`)
        } catch (err) {
            console.error(`Error creating table: ${query.split(" ")[5]}`, err)
            errors.push(`${query.split(" ")[5]} table: ${err.message}`)
        }
    }

    if (errors.length > 0) {
        message = "Errors occurred: " + errors.join("; ")
        res.status(500).json({
            success: false,
            message: message,
            errors: errors,
        })
    } else {
        res.json({
            success: true,
            message: "All tables created successfully: Products, Users, ProductDescription, ProductPrice, Orders",
        })
    }
})

// Add a route to check database connection
app.get("/test-connection", async (req, res) => {
    try {
        const [results] = await connection.query("SELECT 1 + 1 AS result")
        res.json({
            success: true,
            message: "Database connection working",
            result: results[0].result,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        })
    }
})

// Add a route to show existing tables
app.get("/show-tables", async (req, res) => {
    try {
        const [results] = await connection.query("SHOW TABLES")
        res.json({
            success: true,
            tables: results,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
        })
    }
})

// Route to handle product submission
app.post("/add-product", async (req, res) => {
    const {
        product_name,
        product_url,
        product_brief_description,
        product_description,
        product_img,
        product_link,
        starting_price,
        price_range,
    } = req.body

    // Basic validation (can be expanded)
    if (!product_name || !product_url || !starting_price) {
        return res.status(400).json({ success: false, message: "Missing required product fields." })
    }

    try {
        // Insert into Products table
        const [productResult] = await connection.query("INSERT INTO Products (product_name, product_url) VALUES (?, ?)", [
            product_name,
            product_url,
        ])
        const productId = productResult.insertId

        // Insert into ProductDescription table
        await connection.query(
            "INSERT INTO ProductDescription (product_id, product_brief_description, product_description, product_img, product_link) VALUES (?, ?, ?, ?, ?)",
            [productId, product_brief_description, product_description, product_img, product_link],
        )

        // Insert into ProductPrice table
        await connection.query("INSERT INTO ProductPrice (product_id, starting_price, price_range) VALUES (?, ?, ?)", [
            productId,
            starting_price,
            price_range,
        ])

        res.status(200).json({ success: true, message: "Product added successfully!" })
    } catch (error) {
        console.error("Error adding product:", error)
        res.status(500).json({ success: false, message: "Error adding product: " + error.message })
    }
})
// Route to get all iPhone products
app.get("/iphones", async (req, res) => {
  try {
    const [rows] = await connection.query(
      "SELECT * FROM Products \
       JOIN ProductDescription ON Products.product_id = ProductDescription.product_id \
       JOIN ProductPrice ON Products.product_id = ProductPrice.product_id"
    );

    res.json({ products: rows });
  } catch (err) {
    console.error("Error fetching iPhones:", err);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
});
// app.get("/test-product/:id", async (req, res) => {
//     const phoneId = req.params.id;
//     res.json({
//         message: "API endpoint is working",
//         requestedId: phoneId,
//         timestamp: new Date().toISOString()
//     });
// });
// Single iPhone product
app.get("/iphones/:id", async (req, res) => {
    const phoneId = req.params.id;
    const query = `
      SELECT * FROM Products
      JOIN ProductDescription ON Products.product_id = ProductDescription.product_id
      JOIN ProductPrice ON Products.product_id = ProductPrice.product_id
      WHERE Products.product_id = ?
    `;

    try {
        const [rows] = await connection.query(query, [phoneId]);

        if (rows.length === 0) {
            res.status(404).send("Product not found");
        } else {
            const phone = rows[0];
            res.json(phone);
        }
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Internal Server Error");
    }
});
// // Test route to check if the API endpoint is accessible

app.get('/api/youtube-videos', async (req, res) => {
  try {
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
    const MAX_RESULTS = process.env.YOUTUBE_MAX_RESULTS;

    const response = await fetch(
      `https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=${MAX_RESULTS}&order=date&key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('YouTube API request failed');
    }

    const data = await response.json();
    res.json(data.items);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
})