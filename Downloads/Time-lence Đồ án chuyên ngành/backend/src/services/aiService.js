// AI Service - Phân tích ưu tiên sự kiện
const { differenceInHours, differenceInMinutes } = require('date-fns');

class AIService {
    // Tính điểm ưu tiên cho sự kiện
    calculatePriorityScore(event) {
        let score = 0;
        const reasons = [];

        const now = new Date();
        const eventStart = new Date(event.start_time);
        const hoursUntilEvent = differenceInHours(eventStart, now);

        // 1. Urgency (40 điểm)
        if (hoursUntilEvent <= 1) {
            score += 40;
            reasons.push('Bắt đầu trong 1 giờ tới');
        } else if (hoursUntilEvent <= 3) {
            score += 30;
            reasons.push('Bắt đầu trong 3 giờ');
        } else if (hoursUntilEvent <= 6) {
            score += 20;
            reasons.push('Bắt đầu trong 6 giờ');
        } else if (hoursUntilEvent <= 24) {
            score += 10;
            reasons.push('Bắt đầu trong 24 giờ');
        } else {
            score += 5;
        }

        // 2. Category priority (25 điểm)
        const categoryPriority = {
            'work': 25, 'urgent': 25, 'important': 20, 'deadline': 25,
            'health': 22, 'meeting': 18, 'education': 15, 'personal': 10
        };
        const catName = (event.category_name || '').toLowerCase();
        let catScore = 10;
        for (const [key, val] of Object.entries(categoryPriority)) {
            if (catName.includes(key)) catScore = val;
        }
        score += catScore;

        // 3. Duration (15 điểm)
        const durationMins = differenceInMinutes(new Date(event.end_time), eventStart);
        if (durationMins >= 120) score += 15;
        else if (durationMins >= 60) score += 10;
        else if (durationMins >= 30) score += 5;

        // 4. Reminders (10 điểm)
        if (event.reminders && event.reminders.length > 0) {
            score += 10;
            reasons.push(`${event.reminders.length} nhắc nhở đã đặt`);
        }

        // 5. Location (5 điểm)
        if (event.location) score += 5;

        // Determine level
        let level = 'low';
        if (score >= 70) level = 'critical';
        else if (score >= 50) level = 'high';
        else if (score >= 30) level = 'medium';

        return { total: score, level, reason: reasons, urgencyPercent: Math.min(100, hoursUntilEvent <= 1 ? 100 : (1 - hoursUntilEvent / 24) * 100) };
    }

    // Phân tích ưu tiên tất cả sự kiện
    async analyzePriority(events) {
        if (!events || events.length === 0) return { data: [], categorized: {} };

        const analyzed = events.map(e => ({
            ...e,
            ...this.calculatePriorityScore(e)
        })).sort((a, b) => b.total - a.total);

        return {
            data: analyzed,
            categorized: {
                critical: analyzed.filter(e => e.level === 'critical'),
                high: analyzed.filter(e => e.level === 'high'),
                medium: analyzed.filter(e => e.level === 'medium'),
                low: analyzed.filter(e => e.level === 'low')
            }
        };
    }

    // Tìm những slot thời gian rảnh trong ngày
    findFreeTimeSlots(events, dayStart, dayEnd) {
        if (!events || events.length === 0) {
            return [{
                start: dayStart,
                end: dayEnd,
                durationHours: differenceInHours(dayEnd, dayStart),
                available: true
            }];
        }

        // Sắp xếp sự kiện theo thời gian
        const sorted = events.slice().sort((a, b) => 
            new Date(a.start_time) - new Date(b.start_time)
        );

        const slots = [];
        let currentTime = new Date(dayStart);

        sorted.forEach(event => {
            const eventStart = new Date(event.start_time);
            
            // Nếu có khoảng trống trước sự kiện
            if (currentTime < eventStart) {
                slots.push({
                    start: new Date(currentTime),
                    end: new Date(eventStart),
                    durationHours: differenceInHours(eventStart, currentTime),
                    durationMins: differenceInMinutes(eventStart, currentTime),
                    available: true,
                    type: 'free'
                });
            }
            
            // Cập nhật thời gian hiện tại
            currentTime = new Date(event.end_time);
        });

        // Khoảng trống sau sự kiện cuối cùng
        if (currentTime < dayEnd) {
            slots.push({
                start: new Date(currentTime),
                end: new Date(dayEnd),
                durationHours: differenceInHours(dayEnd, currentTime),
                durationMins: differenceInMinutes(dayEnd, currentTime),
                available: true,
                type: 'free'
            });
        }

        return slots.filter(s => s.durationMins >= 30); // Chỉ lấy slot >= 30 phút
    }

    // Gợi ý ngày/giờ tốt nhất để xếp lịch
    suggestScheduleTime(events, eventDurationMins = 60) {
        // Tính từ hôm nay đến 7 ngày tới
        const suggestions = [];
        
        for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
            const date = new Date();
            date.setDate(date.getDate() + dayOffset);
            
            const dayStart = new Date(date);
            dayStart.setHours(8, 0, 0, 0);
            
            const dayEnd = new Date(date);
            dayEnd.setHours(18, 0, 0, 0);

            const dayEvents = events.filter(e => {
                const eventDate = new Date(e.start_time);
                return eventDate.toDateString() === date.toDateString();
            });

            const slots = this.findFreeTimeSlots(dayEvents, dayStart, dayEnd);
            
            // Tìm slot có đủ thời gian
            const suitableSlot = slots.find(s => s.durationMins >= eventDurationMins);
            
            if (suitableSlot) {
                const endTime = new Date(suitableSlot.start.getTime() + eventDurationMins * 60000);
                const suggestion = {
                    date: date.toLocaleDateString('vi-VN'),
                    day: dayOffset === 0 ? 'Hôm nay' : dayOffset === 1 ? 'Ngày mai' : `${dayOffset} ngày tới`,
                    availableSlots: slots.map(slot => ({
                        start: slot.start.toISOString(),
                        end: slot.end.toISOString(),
                        durationMins: slot.durationMins
                    })),
                    recommendedTime: {
                        start: suitableSlot.start.toISOString(),
                        end: endTime.toISOString(),
                        durationMins: eventDurationMins
                    }
                };
                suggestions.push(suggestion);
            }
        }

        return suggestions;
    }

    // Chat AI - trả lời câu hỏi
    answerQuestion(question, events) {
        const q = question.toLowerCase();
        
        // Câu hỏi về thời gian rảnh - "ngày nào rảnh"
        if (q.includes('rảnh') || q.includes('slot') || q.includes('thời gian') || q.includes('xếp') || q.includes('ngày nào')) {
            const freeSlots = this.suggestScheduleTime(events, 60);
            if (freeSlots.length === 0) {
                return {
                    answer: '⚠️ Trong 7 ngày tới bạn lịch khá dày. Tôi gợi ý bạn nên xem xét việc hoãn hoặc giảm thời gian cho một số sự kiện.',
                    data: null
                };
            }
            
            // Format danh sách các ngày rảnh
            let answer = '📅 **Các ngày rảnh để xếp lịch:**\n\n';
            freeSlots.slice(0, 5).forEach((slot, index) => {
                const startTime = new Date(slot.recommendedTime.start).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                const endTime = new Date(slot.recommendedTime.end).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                const emoji = index === 0 ? '⭐' : index === 1 ? '✨' : '📌';
                answer += `${emoji} **${slot.day}** (${slot.date})\n   ⏰ ${startTime} - ${endTime}\n   📊 ${slot.availableSlots.length} slot rảnh trong ngày\n\n`;
            });
            
            return {
                answer: answer.trim(),
                data: {
                    type: 'free_days',
                    suggestions: freeSlots
                }
            };
        }

        // Câu hỏi về liệt kê sự kiện trong ngày
        if (q.includes('sự kiện') && (q.includes('hôm nay') || q.includes('hôm nay') || q.includes('ngày') || q.includes('liệt kê') || q.includes('chi tiết'))) {
            // Parse ngày từ câu hỏi
            let targetDate = new Date();
            targetDate.setHours(0, 0, 0, 0);
            
            // Tìm ngày trong câu hỏi
            if (q.includes('mai') || q.includes('ngày mai')) {
                targetDate.setDate(targetDate.getDate() + 1);
            } else if (q.includes('hôm qua')) {
                targetDate.setDate(targetDate.getDate() - 1);
            }
            
            const dayEvents = events.filter(e => {
                const eventDate = new Date(e.start_time);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === targetDate.getTime();
            });
            
            if (dayEvents.length === 0) {
                const dateStr = targetDate.toLocaleDateString('vi-VN');
                return {
                    answer: `📅 Ngày ${dateStr} bạn không có sự kiện nào.`,
                    data: {
                        type: 'events_list',
                        date: targetDate.toISOString(),
                        events: []
                    }
                };
            }
            
            // Format danh sách sự kiện
            const dateStr = targetDate.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            let answer = `📅 **Sự kiện ngày ${dateStr}:**\n\n`;
            
            dayEvents.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
            
            dayEvents.forEach((event, index) => {
                const startTime = new Date(event.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                const endTime = new Date(event.end_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                const category = event.category_name || 'Khác';
                const location = event.location ? `📍 ${event.location}` : '';
                const description = event.description ? `\n   📝 ${event.description}` : '';
                
                answer += `${index + 1}. **${event.title}**\n`;
                answer += `   ⏰ ${startTime} - ${endTime}\n`;
                answer += `   🏷️ ${category}\n`;
                if (location) answer += `   ${location}\n`;
                if (description) answer += description;
                answer += `\n`;
            });
            
            answer += `\n📊 **Tổng cộng:** ${dayEvents.length} sự kiện`;
            
            return {
                answer: answer.trim(),
                data: {
                    type: 'events_list',
                    date: targetDate.toISOString(),
                    events: dayEvents
                }
            };
        }

        // Câu hỏi về bận
        if (q.includes('bận') || q.includes('busy') || q.includes('workload')) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const todayEvents = events.filter(e => {
                const eventDate = new Date(e.start_time);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate.getTime() === today.getTime();
            });
            
            const totalMinutes = todayEvents.reduce((sum, e) => 
                sum + differenceInMinutes(new Date(e.end_time), new Date(e.start_time)), 0
            );
            const totalHours = (totalMinutes / 60).toFixed(1);
            
            let answer = '';
            if (totalHours >= 8) {
                answer = `⚠️ Hôm nay bạn rất bận với **${totalHours} giờ** sự kiện (${todayEvents.length} sự kiện). Hãy chắc chắn bạn có đủ thời gian để nghỉ ngơi.`;
            } else if (totalHours >= 5) {
                answer = `📊 Hôm nay bạn khá bận với **${totalHours} giờ** sự kiện (${todayEvents.length} sự kiện). Còn ${(24 - totalHours).toFixed(1)} giờ rảnh.`;
            } else {
                answer = `😊 Hôm nay bạn khá rảnh với chỉ **${totalHours} giờ** sự kiện (${todayEvents.length} sự kiện).`;
            }
            
            return {
                answer: answer,
                data: {
                    type: 'busy_status',
                    totalHours: parseFloat(totalHours),
                    eventCount: todayEvents.length
                }
            };
        }

        // Câu hỏi về sự kiện quan trọng
        if (q.includes('quan trọng') || q.includes('ưu tiên') || q.includes('priority')) {
            const important = events.filter(e => {
                const score = this.calculatePriorityScore(e);
                return score.level === 'critical' || score.level === 'high';
            });
            
            if (important.length === 0) {
                return {
                    answer: '✨ Hôm nay bạn không có sự kiện quan trọng nào.',
                    data: { type: 'important_events', events: [] }
                };
            }
            
            let answer = `🎯 Bạn có **${important.length}** sự kiện quan trọng:\n\n`;
            important.slice(0, 5).forEach((event, index) => {
                const startTime = new Date(event.start_time).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'});
                answer += `${index + 1}. **${event.title}** - ${startTime}\n`;
            });
            
            return {
                answer: answer.trim(),
                data: {
                    type: 'important_events',
                    events: important
                }
            };
        }

        // Mặc định
        return {
            answer: '💡 Tôi có thể giúp bạn:\n• Tìm thời gian rảnh để xếp lịch ("ngày nào rảnh")\n• Liệt kê sự kiện trong ngày ("sự kiện hôm nay")\n• Báo cáo bạn bận không ("hôm nay bận không")\n• Liệt kê sự kiện quan trọng ("sự kiện quan trọng")',
            data: null
        };
    }
}

module.exports = new AIService();
