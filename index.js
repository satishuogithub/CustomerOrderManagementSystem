const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const port = 3000;

app.use(express.static(__dirname)); 

app.get("/", (req, res) => {
    res.sendFile(__dirname + "./index.html");
});

const dbPath = "./customer_orders.db"; 

app.use(express.urlencoded({ extended: true });

app.get("/get-customer/:customerId", async (req, res) => {
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

app.get("/get-product/:productId", async (req, res) => {
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

app.get("/get-customer-order/:orderId", async (req, res) => {
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

app.get("/get-customer-orders-for-product/:productId", async (req, res) => {
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
