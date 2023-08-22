const pool = require("../../config/db");
const logger = require("../../logger");
const express = require("express");
const moment = require("moment-timezone");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();

// Configure body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Login user
exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Connection to DB
    const connection = await pool.getConnection();

    // Check if the user with the given email exists in the database
    const [userRows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    const user = userRows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Generate JWT Token
    const token = await jwt.sign(
      { userId: user.user_uuid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    return res.status(200).json({
      message: "Login successful!",
      user: {
        user_uuid: user.user_uuid,
        email: user.email,
        user_type: user.user_type,
      },
      token: token,
    });
    connection.release();
  } catch (err) {
    logger.error("Login error:", err);
    res.status(500).send({ message: "Error in Login" });
  }
};

// Signup or create new customer/user
exports.Signup = async (req, res) => {
  try {
    const {
      userUUID,
      first_name,
      last_name,
      email,
      password,
      user_type,
      company_name,
      address,
      state,
      city,
      pincode,
      phone,
      user_status,
    } = req.body;

    // Hash the password. You can adjust the salt rounds (10) as needed
    const hashedPassword = await bcrypt.hash(password, 10);

    // Ensure pincode and phone are numeric values. Regular expression to check if a string contains only numbers
    const isNumeric = (value) => /^\d+$/.test(value);

    if (!isNumeric(pincode) || !isNumeric(phone)) {
      return res
        .status(400)
        .json({ message: "Pincode and phone must be numeric values." });
    }

    const checkIfExists = async (connection, column, value) => {
      const [rows] = await connection.execute(
        `SELECT ${column} FROM users WHERE ${column} = ?`,
        [value]
      );

      return rows.length > 0;
    };

    // Connection to DB
    const connection = await pool.getConnection();

    // Check Email Already Exist
    const emailExists = await checkIfExists(connection, "email", email);
    if (emailExists) {
      return res.status(409).json({ message: "This email id already exists!" });
    }

    // Check Phone Number Already Exist
    const phoneExists = await checkIfExists(connection, "phone", phone);
    if (phoneExists) {
      return res
        .status(409)
        .json({ message: "This Phone Number Already Used" });
    }

    // Generate current time in Asia/Kolkata timezone
    const currentTimeIST = moment
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss");

    const addQuery =
      "INSERT INTO users(`user_uuid`,`first_name`,`last_name`,`email`,`password`,`user_type`,`company_name`,`address`,`state`,`city`,`pincode`,`phone`,`user_status`,`created_at`,`created_by`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    // Generate a new UUID
    const user_uuid = uuidv4();

    const values = [
      user_uuid,
      first_name,
      last_name,
      email,
      hashedPassword,
      user_type,
      company_name,
      address,
      state,
      city,
      pincode,
      phone,
      user_status,
      currentTimeIST,
      userUUID,
    ];

    // console.log(values);
    const [results] = await connection.execute(addQuery, values);

    res.status(201).json({ message: "Customer Added Successfully!", results });

    connection.release();
  } catch (err) {
    logger.error("Error adding customers:", err);
    res.status(500).send({ message: "Error in Add Customer" });
  }
};

// Get all customers details [admin]
exports.getCustomers = async (req, res) => {
  try {
    // Connection To the Database
    const connection = await pool.getConnection();

    const getQuery =
      "SELECT * FROM users WHERE user_status != ? AND user_type = ? ORDER BY user_id DESC";
    const [customers] = await connection.execute(getQuery, [0, 2]);

    res
      .status(200)
      .send({ total_count: customers.length, customerData: customers });

    connection.release();
  } catch (err) {
    logger.error("Error in fetching the list of Customers");
    res
      .status(500)
      .send({ message: "Error in fetching the list of Customers" });
  }
};

// Update customer
exports.updateCustomers = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      company_name,
      address,
      state,
      city,
      pincode,
      phone,
      user_status,
      userUUID,
    } = req.body;

    const { user_uuid } = req.params;

    // Connection to the database
    const connection = await pool.getConnection();

    // Ensure pincode and phone are numeric values
    const isNumeric = (value) => /^\d+$/.test(value);

    if (!isNumeric(pincode) || !isNumeric(phone)) {
      return res
        .status(400)
        .json({ message: "Pincode and phone must be numeric values." });
    }

    // Check if user exists
    const [existingUserRows] = await connection.execute(
      "SELECT * FROM users WHERE user_uuid = ?",
      [user_uuid]
    );
    if (existingUserRows.length === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Generate current time in Asia/Kolkata timezone
    const currentTimeIST = moment
      .tz("Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss");

    const updateQuery =
      "UPDATE users SET first_name=?, last_name=?, email=?, company_name=?, address=?, state=?, city=?, pincode=?, phone=?, user_status=?, modified_at=?, modified_by = ? WHERE user_uuid=?";
    const values = [
      first_name,
      last_name,
      email,
      company_name,
      address,
      state,
      city,
      pincode,
      phone,
      user_status,
      currentTimeIST,
      userUUID,
      user_uuid,
    ];

    const [results] = await connection.execute(updateQuery, values);

    res
      .status(202)
      .json({ message: "User updated successfully", customerData: results });

    connection.release();
  } catch (err) {
    logger.error("Error updating user:", err);
    res.status(500).send({ message: "Error in updating user" });
  }
};

// Get customer details by customer ID
exports.GetCustomerById = async (req, res) => {
  try {
    const { user_uuid } = req.params;

    const connection = await pool.getConnection();
    const getCustomer =
      "SELECT * FROM users WHERE user_status=? AND user_uuid=?";

    const [results] = await connection.execute(getCustomer, [1, user_uuid]);

    res
      .status(200)
      .send({ message: "Customer Get successfully", customerData: results });

    connection.release();
  } catch (err) {
    logger.error(`Error in fetching customer data. Error-> ${err}`);
    res.status(500).send("Error in fetching Customer");
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const { user_uuid } = req.params;
    //connection to database
    const connection = await pool.getConnection();

    //creating current date and time
    let createdAt = new Date();
    let currentTimeIST = moment
      .tz(createdAt, "Asia/Kolkata")
      .format("YYYY-MM-DD HH:mm:ss ");

    const deleteQuery =
      "UPDATE users SET user_status=?, modified_at=?, modified_by=? WHERE user_uuid=?";

    const [results] = await connection.execute(deleteQuery, [
      0,
      currentTimeIST,
      req.body.userUUID,
      user_uuid,
    ]);

    res.status(200).send({ message: "Customer deleted successfully" });

    connection.release();
  } catch (err) {
    logger.error("Error updating user:", err);
    res.status(500).send({ message: "Error in deleting the Customer" });
  }
};

// Logout
exports.Logout = async (req, res) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authorization token not provided" });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Validate the user ID
    const user_uuid = decodedToken.user_uuid;

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    logger.error("Logout error:", err);
    return res.status(500).json({ message: "Error in Logout" });
  }
};

// Get total customers [admin]
exports.getTotalCustomers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [result] = await pool.query(
      "SELECT COUNT(*) AS count FROM users WHERE user_status != ? AND user_type != ?",
      [0, 1]
    );
    res.status(200).json({
      message: "Successfully fetched the total customers data",
      result,
    });
  } catch (error) {
    logger.error(`Unable of fetched the total customers data ${error}`);
    res
      .status(501)
      .json({ message: "Unable to fetched the total customers data" });
  }
};
