import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly notificationsService: NotificationsService
  ) {}

  async createReport(createReportDto: CreateReportDto, userId: number) {
    const report = this.reportRepository.create({
      user: { id: userId },
      room: { id: createReportDto.roomId },
      reason: createReportDto.reason,
      description: createReportDto.description
    });

    await this.reportRepository.save(report);

    // Gửi thông báo cho admin
    await this.notificationsService.create({
      userId: 1, // Admin ID
      title: 'Báo cáo mới',
      message: `Có báo cáo mới về phòng #${createReportDto.roomId}`,
      type: 'report'
    });

    return report;
  }
} 