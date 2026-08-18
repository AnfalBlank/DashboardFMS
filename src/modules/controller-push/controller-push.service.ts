import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Card,
  Product,
  CardQuota,
  PriceHistory,
  Transaction,
  Tank,
} from '../../database/entities';
import { toNum } from '../../common/utils/db.util';
import { v4 as uuid } from 'uuid';
import { ControllerTransactionPushDto } from './dto/controller-push.dto';

@Injectable()
export class ControllerPushService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepo: Repository<Card>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(CardQuota)
    private readonly cardQuotaRepo: Repository<CardQuota>,
    @InjectRepository(PriceHistory)
    private readonly priceHistoryRepo: Repository<PriceHistory>,
    private readonly dataSource: DataSource,
  ) {}

  async handlePush(body: ControllerTransactionPushDto) {
    const card = await this.cardRepo.findOneBy({ cardNumber: body.card_number });
    if (!card) {
      throw new NotFoundException({
        success: false,
        message: 'Kartu tidak ditemukan',
      });
    }

    const product = await this.productRepo
      .createQueryBuilder('p')
      .where('p.code = :code OR p.id = :id', {
        code: body.product_code ?? '',
        id: body.product_id ?? '',
      })
      .getOne();

    if (!product) {
      throw new NotFoundException({
        success: false,
        message: 'Produk tidak ditemukan',
      });
    }

    const quota = await this.cardQuotaRepo
      .createQueryBuilder('cq')
      .innerJoin('cq.period', 'qp')
      .where('cq.cardId = :cardId AND cq.productId = :productId AND qp.status = :status', {
        cardId: card.id,
        productId: product.id,
        status: 'ACTIVE',
      })
      .getOne();

    const priceHistory = await this.priceHistoryRepo
      .createQueryBuilder('ph')
      .where('ph.productId = :productId', { productId: product.id })
      .orderBy('ph.effectiveDate', 'DESC')
      .getOne();

    const price = toNum(priceHistory?.pricePerUnit);
    const vol = toNum(body.volume_l);
    const total = price * vol;

    const quotaBefore = toNum(quota?.remainingL);
    const quotaDeducted = Math.min(vol, quotaBefore);
    const quotaAfter = Math.max(0, quotaBefore - vol);
    const txStatus: 'SUCCESS' | 'FAILED' = vol > quotaBefore ? 'FAILED' : 'SUCCESS';

    const txId = uuid();

    await this.dataSource.transaction(async (em) => {
      const tx = em.create(Transaction, {
        id: txId,
        cardId: card.id,
        productId: product.id,
        nozzleId: body.nozzle_id ?? undefined,
        pumpId: body.pump_id ?? undefined,
        operatorId: 'usr-admin01',
        shift: (body.shift as any) ?? 'PAGI',
        volumeL: vol,
        pricePerUnit: price,
        totalAmount: total,
        totalizerBefore: body.totalizer_before ? toNum(body.totalizer_before) : undefined,
        totalizerAfter: body.totalizer_after ? toNum(body.totalizer_after) : undefined,
        quotaBefore,
        quotaDeducted,
        quotaAfter,
        status: txStatus,
        source: 'CONTROLLER',
        transactionTime: body.transaction_time ? new Date(body.transaction_time) : new Date(),
      });
      await em.save(Transaction, tx);

      if (txStatus === 'SUCCESS' && quota) {
        await em
          .createQueryBuilder()
          .update(CardQuota)
          .set({
            usedL: () => `used_l + ${quotaDeducted}`,
            remainingL: () => `remaining_l - ${quotaDeducted}`,
          })
          .where('id = :id', { id: quota.id })
          .execute();

        await em
          .createQueryBuilder()
          .update(Tank)
          .set({
            currentL: () => `GREATEST(0, current_l - ${vol})`,
          })
          .where('productId = :productId', { productId: product.id })
          .execute();
      }
    });

    return { id: txId, status: txStatus };
  }
}
