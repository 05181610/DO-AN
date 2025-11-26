const CONSTANTS = {
    // API Configuration
    API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    
    // Routes
    PATH: {
        HOME: '/',
        LOGIN: '/login',
        REGISTER: '/register',
        DASHBOARD: '/dashboard',
        PROFILE: '/profile',
        ROOMS: '/rooms',
        ROOM_DETAIL: '/rooms/:id',
        POST_ROOM: '/post-room',
        MY_ROOMS: '/my-rooms',
        FAVORITES: '/favorites',
        BOOKINGS: '/bookings',
        NOT_FOUND: '*',
    },
    
    // Storage Keys
    TOKEN_KEY: 'smartroom_token',
    USER_KEY: 'smartroom_user',
    
    // Pagination
    LIMIT_ROOMS_PER_PAGE: 12,
    LIMIT_SEARCH_RESULTS: 20,
    PAGE_DEFAULT: 1,
    
    // Room Types
    ROOM_TYPES: {
        APARTMENT: 'APARTMENT',
        MOTEL: 'MOTEL',
        HOUSE: 'HOUSE',
    },
    
    // File Upload
    ACCEPT_FILE: '.jpg,.jpeg,.png,.pdf',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    
    // Date Format
    DATE_FORMAT: 'YYYY-MM-DD',
    DISPLAY_DATE_FORMAT: 'DD/MM/YYYY',
    
    // User Roles
    USER_ROLES: {
        TENANT: 'tenant',
        LANDLORD: 'landlord',
    },
};

export { CONSTANTS };