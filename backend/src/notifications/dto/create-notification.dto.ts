export class CreateNotificationDto {
    readonly title: string;
    readonly message: string;
    readonly type: 'booking' | 'review' | 'system';
    readonly userId: number;
    readonly isRead?: boolean;
    readonly metadata?: Record<string, any>;
} 