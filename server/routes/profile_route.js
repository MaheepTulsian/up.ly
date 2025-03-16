import express from "express";
import Profile from "../database/schema/profileSchema.js";
import bodyParser from "body-parser";
import multer from "multer";

const profileRoute = express.Router();
profileRoute.use(bodyParser.json());
profileRoute.use(bodyParser.urlencoded({ extended: true }));
const upload = multer();

// Regex for email and phone validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/; // Assumes a 10-digit phone number

// Function to validate DOB
const validateDOB = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    const minAgeDate = new Date(today.setFullYear(today.getFullYear() - 14)); // At least 14 years old

    if (dob > new Date()) {
        return { valid: false, message: "Date of birth cannot be in the future." };
    }
    if (dob > minAgeDate) {
        return { valid: false, message: "User must be at least 14 years old." };
    }
    return { valid: true };
};

// POST API for adding/updating personal info
profileRoute.post("/personal-info", upload.none(), async (req, res) => {
    try {
        const { firstName, lastName, email, phone, dateOfBirth, address, resume } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return res.status(400).json({ message: "First name, last name, and email are required." });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format." });
        }

        // Validate phone format (if provided)
        if (phone && !phoneRegex.test(phone)) {
            return res.status(400).json({ message: "Phone number must be a 10-digit number." });
        }

        // Validate DOB
        if (dateOfBirth) {
            const dobValidation = validateDOB(dateOfBirth);
            if (!dobValidation.valid) {
                return res.status(400).json({ message: dobValidation.message });
            }
        }

        // Check if a profile with the same email already exists
        const existingProfile = await Profile.findOne({ "personalInfo.email": email });

        if (existingProfile) {
            // Update the entire profile with the new data
            const updatedProfile = await Profile.findOneAndUpdate({
                    "personalInfo.email: email },
                { $set: req.body }, // Update all fields with the new data
                { new: true } // Return the updated document
            );

            return res.status(200).json({ message: "Profile updated successfully.", profile: updatedProfile });
        } else {
            // Create a new profile
            const newProfile = new Profile({
                personalInfo: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    dateOfBirth,
                    address: address ? JSON.parse(address) : null,
                    resume
                }
            });

            await newProfile.save();
            return res.status(201).json({ message: "Profile created successfully.", profile: newProfile });
        }
    } catch (error) {
        console.error("Error saving/updating profile:", error);
        res.status(500).json({ message: "An error occurred while saving/updating the profile." });
    }
});

export default profileRoute;