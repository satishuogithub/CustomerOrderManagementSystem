const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); 
const port = 3000;

app.use(express.static(__dirname)); // Serve static files from the current directory
app.use(express.json()); // Parse JSON request bodies

const dbPath = "./randomdb.db"; // 

// Secret key for JWT (change this to a secure value)
const secretKey = "random-string";

app.get("/", (req, res) => {
    res.sendFile(__dirname + "./index.html");
});

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
    const token = req.header("Authorization");
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Query to find a user by email
        const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

        if (user) {
            // Compare the provided password with the hashed password stored in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (isPasswordValid) {
                // Password is valid, generate and return a JWT token for authentication
                const token = jwt.sign({ id: user.id, email: user.email }, secretKey);
                res.status(200).json({ token });
            } else {
                // Password is not valid
                res.status(401).send("Invalid password");
            }
        } else {
            // User with the provided email not found
            res.status(404).send("User not found.");
        }

        await db.close();
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error during login.");
    }
});

app.get("/get-customer/:customerId", authenticateToken, async (req, res) => {
    try {
        const { customerId } = req.params;

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Query to find a customer by customerId
        const customer = await db.get("SELECT * FROM users WHERE id = ?", [customerId]);
        
        await db.close();

        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404).send("Customer not found.");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error retrieving customer data.");
    }
});

app.get("/get-product/:productId", authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Query to find a product by productId
        const product = await db.get("SELECT * FROM products WHERE id = ?", [productId]);
        
        await db.close();

        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).send("Product not found.");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error retrieving product data.");
    }
});

app.get("/get-customer-order/:orderId", authenticateToken, async (req, res) => {
    try {
        const { orderId } = req.params;

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Query to find a CustomerOrder by orderId
        const customerOrder = await db.get("SELECT * FROM customer_orders WHERE id = ?", [orderId]);
        
        await db.close();

        if (customerOrder) {
            res.status(200).json(customerOrder);
        } else {
            res.status(404).send("CustomerOrder not found.");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error retrieving CustomerOrder data.");
    }
});

app.get("/get-customer-orders-for-product/:productId", authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Query to find all customer orders for a given product by productId
        const customerOrders = await db.all("SELECT * FROM customer_orders WHERE product_id = ?", [productId]);
        
        await db.close();

        if (customerOrders.length > 0) {
            res.status(200).json(customerOrders);
        } else {
            res.status(404).send("No customer orders found for the product.");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error retrieving customer orders data.");
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
