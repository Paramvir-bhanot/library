import { image } from "framer-motion/client";
import mongoose from "mongoose";
const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true    
    },
    password: {
        type: String,
        required: true // not required for google/facebook login
    },
    image: {
        type: String,
    },
    provider:{
        type: String,
        default: 'credentials', // 'credentials', 'google', 'facebook', etc.} 
    },
    applicantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Applicant'
    }
}, { timestamps: true });   
export default mongoose.model('Visitor', visitorSchema); 