import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardReasonDto } from './dto/card-reason.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('api/cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @RequirePermissions('card.view')
  @ApiOperation({ summary: 'List cards with filter and pagination' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'unit', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('unit') unit?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const result = await this.cardsService.findAll(
      search,
      status,
      unit,
      limit ? Number(limit) : 100,
      offset ? Number(offset) : 0,
    );
    return { success: true, ...result };
  }

  @Get(':id')
  @RequirePermissions('card.view')
  @ApiOperation({ summary: 'Get card details by ID or card number' })
  async findOne(@Param('id') id: string) {
    const data = await this.cardsService.findOne(id);
    return { success: true, data };
  }

  @Get(':id/transactions')
  @RequirePermissions('transaction.view')
  @ApiOperation({ summary: 'Get transaction history of a card' })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async findTransactions(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const data = await this.cardsService.findTransactions(
      id,
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
    );
    return { success: true, data };
  }

  @Get(':id/quota')
  @RequirePermissions('quota.view')
  @ApiOperation({ summary: 'Get quotas of a card' })
  async findQuota(@Param('id') id: string) {
    const data = await this.cardsService.findQuota(id);
    return { success: true, data };
  }

  @Post()
  @RequirePermissions('card.create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new card' })
  async create(
    @Body() dto: CreateCardDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.cardsService.create(dto, userId, ip);
    return { success: true, data };
  }

  @Put(':id')
  @RequirePermissions('card.edit')
  @ApiOperation({ summary: 'Update card details' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.cardsService.update(id, dto, userId, ip);
    return { success: true, ...data };
  }

  @Post(':id/block')
  @RequirePermissions('card.block')
  @ApiOperation({ summary: 'Block card' })
  async block(
    @Param('id') id: string,
    @Body() dto: CardReasonDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.cardsService.block(id, dto.reason, userId, ip);
    return { success: true, ...data };
  }

  @Post(':id/unblock')
  @RequirePermissions('card.block')
  @ApiOperation({ summary: 'Unblock card' })
  async unblock(
    @Param('id') id: string,
    @Body() dto: CardReasonDto,
    @CurrentUser('userId') userId: string,
    @Ip() ip: string,
  ) {
    const data = await this.cardsService.unblock(id, dto.reason, userId, ip);
    return { success: true, ...data };
  }
}
