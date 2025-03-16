import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        "username": {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        "password": String,
        "personalInfo": {
            "firstName": String,
            "lastName": String,
            "email": {
                type: String,
                required: true,
                unique: true,
                index: true
            },
            "phone": String,
            "dateOfBirth": Date,
            "address": {
                "street": String,
                "city": String,
                "state": String,
                "country": String,
                "zipCode": String
            },
            "resume": String 
        },
        "academic": [
            {
                "institution": String,
                "degree": String,
                "fieldOfStudy": String,
                "startDate": Date,
                "endDate": Date,
                "description": String,
                "grade": String
            }
        ],
        "projects": [
            {
                "title": String,
                "description": String,
                "startDate": Date,
                "endDate": Date,
                "technologiesUsed": [String],
                "projectLink": String,
                "isOpenSource": Boolean
            }
        ],
        "skills": [String],
        "workEx": [
            {
                "company": String,
                "position": String,
                "startDate": Date,
                "endDate": Date,
                "description": String,
                "isCurrent": Boolean
            }
        ],
        "certifications": [
            {
                "name": String,
                "issuingOrganization": String,
                "issueDate": Date,
                "expirationDate": Date,
                "credentialId": String,
                "credentialURL": String
            }
        ],
        "achievements": [
            {
                "title": String,
                "description": String,
                "date": Date,
                "issuer": String
            }
        ],
        "publications": [
            {
                "title": String,
                "publisher": String,
                "publicationDate": Date,
                "description": String,
                "link": String
            }
        ],
        "openSource": [
            {
                "projectName": String,
                "role": String,
                "description": String,
                "startDate": Date,
                "endDate": Date,
                "contributionLink": String
            }
        ],
        "socials": {
            "linkedIn": String,
            "github": String,
            "twitter": String,
            "website": String,
            "medium": String,
            "stackOverflow": String,
            "leetcode": String
        },
        "volunteering": [
            {
                "organization": String,
                "role": String,
                "startDate": Date,
                "endDate": Date,
                "description": String
            }
        ],
        "hobbies": [String],
        "references": [
            {
                "name": String,
                "relationship": String,
                "contact": String,
                "description": String
            }
        ],
        "patents": [
            {
                "title": String,
                "patentNumber": String,
                "issueDate": Date,
                "description": String,
                "link": String
            }
        ]
    }, { timestamps: true }
);

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;