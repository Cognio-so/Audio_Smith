const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        default: 'New Chat'
    },
    conversation: [{
        content: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: ['user', 'assistant']
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Add compound index for faster queries
chatSchema.index({ userId: 1, chatId: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema); 