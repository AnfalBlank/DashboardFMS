import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { VoidTransactionDto } from './dto/void-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'List transactions with filters and pagination' })
  @ApiQuery({ name: 'card', required: false })
  @ApiQuery({ name: 'unit', required: false })
  @ApiQuery({ name: 'product', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(
    @Query('card') card?: string,
    @Query('unit') unit?: string,
    @Query('product') product?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.transactionsService.findAll(
      card,
      unit,
      product,
      status,
      from,
      to,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
    return { success: true, ...result };
  }

  @Get(':id')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'Get transaction details by ID' })
  async findOne(@Param('id') id: string) {
    const data = await this.transactionsService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('transaction.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new transaction' })
  async create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.transactionsService.create(dto, userId, ip);
    return { success: true, data };
  }

  @Post(':id/void')
  @RequirePermissions('transaction.void')
  @ApiOperation({ summary: 'Void a success transaction' })
  async void(
    @Param('id') id: string,
    @Body() dto: VoidTransactionDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.transactionsService.void(id, dto.reason, userId, ip);
    return { success: true, ...data };
  }
}
