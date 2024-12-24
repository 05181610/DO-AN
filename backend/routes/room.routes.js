const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', roomController.getRooms);
router.get('/featured', roomController.getFeaturedRooms);
router.get('/latest', roomController.getLatestRooms);
router.get('/:id', roomController.getRoomById);
router.get('/:id/reviews', roomController.getRoomReviews);

// Protected routes
router.use(authMiddleware);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.post('/:id/reviews', roomController.addReview);
router.get('/my-rooms', roomController.getMyRooms);

module.exports = router;
