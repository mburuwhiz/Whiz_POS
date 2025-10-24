import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { BusinessesService } from './businesses.service';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Post()
  create(@Body() createBusinessDto: any) {
    return this.businessesService.createBusinessWithAdmin(createBusinessDto);
  }

  @Get()
  findAll() {
    return this.businessesService.findAll();
  }

  @Post(':id/issue-api-key')
  issueApiKey(@Param('id') id: string) {
    return this.businessesService.issueApiKey(id);
  }

  @Patch(':id/activate-key')
  activateApiKey(@Param('id') id: string, @Body('key') key: string) {
    return this.businessesService.activateApiKey(id, key);
  }
}
