const Chat = require('../model/Chat');

const saveChat = async (req, res) => {
    try {
        const { chatId, title, conversation } = req.body;
        const userId = req.user._id; // Make sure we're using _id from mongoose

        if (!chatId || !conversation) {
            return res.status(400).json({
                success: false,
                message: "ChatId and conversation are required"
            });
        }

        // Save entire conversation at once
        const chat = await Chat.findOneAndUpdate(
            { chatId, userId },
            { 
                title,
                conversation,
                lastUpdated: new Date()
            },
            { 
                upsert: true, 
                new: true,
                setDefaultsOnInsert: true
            }
        );

        console.log('Chat saved:', chat); // Add logging

        res.json({ 
            success: true, 
            chat,
            message: "Chat saved successfully" 
        });
    } catch (error) {
        console.error('Save chat error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error saving chat conversation",
            error: error.message 
        });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const userId = req.user._id; // Make sure we're using _id from mongoose
        const chats = await Chat.find({ userId })
            .sort({ lastUpdated: -1 });

        res.json({ 
            success: true, 
            chats,
            message: "Chat history retrieved successfully"
        });
    } catch (error) {
        console.error('Get chat history error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching chat history",
            error: error.message
        });
    }
};

const getChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        console.log('Fetching chat:', chatId, 'for user:', userId); // Debug log

        const chat = await Chat.findOne({ chatId, userId });
        
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found"
            });
        }

        // Make sure we're sending all the necessary data
        const chatData = {
            chatId: chat.chatId,
            title: chat.title,
            conversation: chat.conversation.map(msg => ({
                content: msg.content,
                role: msg.role,
                timestamp: msg.timestamp
            })),
            lastUpdated: chat.lastUpdated
        };

        console.log('Sending chat data:', chatData); // Debug log

        res.json({
            success: true,
            chat: chatData,
            message: "Chat retrieved successfully"
        });
    } catch (error) {
        console.error('Get chat error:', error);
        res.status(500).json({
            success: false,
            message: "Error retrieving chat",
            error: error.message
        });
    }
};

module.exports = {
    saveChat,
    getChatHistory,
    getChat
}; 