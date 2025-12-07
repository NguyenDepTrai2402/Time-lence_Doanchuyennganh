import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Request interceptor - add access token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const { data } = await axios.post('/api/auth/refresh-token', {}, {
                    withCredentials: true
                })

                if (data.success) {
                    localStorage.setItem('accessToken', data.data.accessToken)
                    originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export const aiApi = {
    analyzePriority: () => api.get('/ai/analyze-priority').then(r => r.data.data),
    findFreeTime: (duration = 60) => api.get(`/ai/find-free-time?duration=${duration}`).then(r => r.data.data),
    chat: (question) => api.post('/ai/chat', { question }).then(r => {
        const data = r.data.data;
        return {
            answer: data.answer || 'Không có phản hồi',
            data: data.data || null
        };
    })
}

export default api
