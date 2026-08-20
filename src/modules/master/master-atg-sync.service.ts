import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { FmsService } from "../fms";
import { Repository } from "typeorm";
import { ENABLER_DB_CONNECTION, EnablerSettingProduk } from "src/database/enabler";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/database/entities";
import { Cron } from "@nestjs/schedule";



@Injectable()
export class MasterAtgSyncService implements OnModuleInit {
    private readonly logger = new Logger(MasterAtgSyncService.name);

    constructor(
        @InjectRepository(EnablerSettingProduk, ENABLER_DB_CONNECTION)
        private readonly enablerSettingProductRepo: Repository<EnablerSettingProduk>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>
    ) { }

    onModuleInit() {
        this.masterProductSync();
    }

    @Cron('0 */10 * * * *') // every 10 menit
    async masterProductSync() {
        this.logger.debug('Start auto-sync master product with enabler...');
        const products = await this.productRepo.find({
            relations: ['priceHistories']
        });
        for (const product of products) {
            const enablerProduct = await this.enablerSettingProductRepo.findOne({ where: { nama_produk: product.name } });
            const price = Math.floor((product.getActivePrice()?.pricePerUnit || 0)).toString();
            if (!enablerProduct) {
                await this.enablerSettingProductRepo.save({
                    nama_produk: product.name,
                    code_produk: product.code,
                    harga_produk: price,
                    status: product.subsidi ? 'SUBSIDI' : null
                })
            } else {
                this.logger.debug(`Updating price for ${product.name}`);
                enablerProduct.harga_produk = price;
                enablerProduct.code_produk = product.code;
                if (product.subsidi) {
                    enablerProduct.status = 'SUBSIDI';
                }
                await this.enablerSettingProductRepo.save(enablerProduct);
            }
        }
        this.logger.debug(`Sync Product Done`);
    }
}