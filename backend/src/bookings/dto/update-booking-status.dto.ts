export class UpdateBookingStatusDto {
    readonly status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
} 