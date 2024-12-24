import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @Body() paymentData: { roomId: number; amount: number },
    @Request() req,
  ) {
    return this.paymentsService.createPayment(
      req.user.id,
      paymentData.roomId,
      paymentData.amount
    );
  }

  @Get('vnpay-return')
  async vnPayReturn(@Query() vnpParams: any) {
    return this.paymentsService.handleVnPayReturn(vnpParams);
  }
} 