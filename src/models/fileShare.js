const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    originalName: { 
        type: String, 
        required: true 
    },
    
    savedName: { 
        type: String, 
        required: true 
    },
    
    size: { 
        type: Number, 
        required: true 
    },
});

const fileShareSchema = new mongoose.Schema({
    inviteCode: { 
        type: String, 
        required: true, 
        unique: true 
    },
  
    files: [fileSchema],
  
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 86400 
    }, // Auto delete after 24h
});

module.exports = mongoose.model("FileShare", fileShareSchema);
