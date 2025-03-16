import express from "express";
import Profile from "../database/schema/profileSchema.js";
import bodyParser from "body-parser";
import multer from "multer";
import bcrypt from "bcryptjs";

const profileRoute = express.Router();
profileRoute.use(bodyParser.json());
profileRoute.use(bodyParser.urlencoded({ extended: true }));
const upload = multer();

// ✅ Register User
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Check if username already exists
        const existingUser = await Profile.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already exists" });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user (storing only username & password)
        const newUser = new Profile({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            userId: newUser._id,  // Return the user _id
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});


// ✅ Login User
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            return res.status(400).json({ message: "Username and password are required" });
        }

        // Check if user exists
        const user = await Profile.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid username or password" });

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid username or password" });

        res.status(200).json({
            message: "Login successful",
            userId: user._id,  // Return the user _id
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});




export default profileRoute;