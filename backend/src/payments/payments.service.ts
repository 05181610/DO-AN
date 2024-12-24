import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  private readonly vnpUrl = process.env.VNP_URL;
  private readonly vnpTmnCode = process.env.VNP_TMN_CODE;
  private readonly vnpHashSecret = process.env.VNP_HASH_SECRET;
  private readonly vnpReturnUrl = process.env.VNP_RETURN_URL;

  private createSignature(params: any) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', this.vnpHashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return {
      ...sortedParams,
      vnp_SecureHash: signed
    };
  }

  async createVnPayUrl(orderId: string, amount: number) {
    const vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.vnpTmnCode,
      vnp_Amount: amount * 100,
      vnp_CreateDate: new Date().toISOString(),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: '',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Payment for order ${orderId}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: this.vnpReturnUrl,
      vnp_TxnRef: orderId,
    };

    const signedParams = this.createSignature(vnpParams);
    return `${this.vnpUrl}?${new URLSearchParams(signedParams).toString()}`;
  }

  async createPayment(userId: number, roomId: number, amount: number) {
    const payment = this.paymentRepository.create({
      user: { id: userId },
      room: { id: roomId },
      amount,
      status: 'pending'
    });
    
    const savedPayment = await this.paymentRepository.save(payment);
    const vnpayUrl = await this.createVnPayUrl(savedPayment.id.toString(), amount);
    
    return {
      payment: savedPayment,
      paymentUrl: vnpayUrl
    };
  }

  async handleVnPayReturn(vnpParams: any) {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const orderId = vnpParams['vnp_TxnRef'];
    const responseCode = vnpParams['vnp_ResponseCode'];

    const payment = await this.paymentRepository.findOne({
      where: { id: parseInt(orderId) }
    });

    if (payment) {
      payment.status = responseCode === '00' ? 'completed' : 'failed';
      await this.paymentRepository.save(payment);
    }

    return {
      success: responseCode === '00',
      orderId,
      message: responseCode === '00' ? 'Payment successful' : 'Payment failed'
    };
  }
} 