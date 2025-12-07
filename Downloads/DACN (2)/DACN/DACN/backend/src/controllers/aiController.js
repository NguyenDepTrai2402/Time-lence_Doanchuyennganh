// AI Controller
const { success, error } = require('../utils/responseHelper');
const { catchAsync } = require('../middlewares/errorMiddleware');
const aiService = require('../services/aiService');
const { Event } = require('../models');

// Phân tích ưu tiên
const analyzePriority = catchAsync(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.findByUserId(req.user.userId, {
        startDate: today.toISOString()
    });

    const result = await aiService.analyzePriority(events || []);
    
    success(res, {
        events: result.data,
        categorized: result.categorized,
        totalEvents: result.data.length
    });
});

// Tìm thời gian rảnh
const findFreeTime = catchAsync(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.findByUserId(req.user.userId, {
        startDate: today.toISOString()
    });

    const { duration = 60 } = req.query; // Default 60 minutes
    const suggestions = aiService.suggestScheduleTime(events || [], parseInt(duration));
    
    success(res, {
        suggestions: suggestions,
        nextAvailable: suggestions[0] || null
    });
});

// Chat với AI
const chat = catchAsync(async (req, res) => {
    const { question } = req.body;

    if (!question || question.trim().length === 0) {
        return error(res, 'Vui lòng nhập câu hỏi', 400);
    }

    // Lấy events trong 7 ngày tới để có đủ dữ liệu
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);

    const events = await Event.findByUserId(req.user.userId, {
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString()
    });

    const result = aiService.answerQuestion(question, events || []);
    
    success(res, {
        question: question,
        answer: result.answer,
        data: result.data || null, // Thêm structured data nếu có
        timestamp: new Date()
    });
});

module.exports = {
    analyzePriority,
    findFreeTime,
    chat
};
