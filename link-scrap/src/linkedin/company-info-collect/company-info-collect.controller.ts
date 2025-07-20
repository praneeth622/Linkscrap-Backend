import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompanyInfoCollectService } from './company-info-collect.service';
import { CompanyUrlDto } from '../../brightdata/dto';

@ApiTags('LinkedIn Company Information Collection')
@Controller('linkedin/company-info/collect')
export class CompanyInfoCollectController {
  constructor(private readonly companyInfoCollectService: CompanyInfoCollectService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Collect LinkedIn company information by URLs',
    description: 'Scrape comprehensive LinkedIn company information using provided company URLs via BrightData API. Returns detailed company data immediately after collection completes.'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully collected company information',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Successfully collected 1 companies' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              company_id: { type: 'string', example: '2330778' },
              name: { type: 'string', example: 'Mighty Networks' },
              website: { type: 'string', example: 'https://www.mightynetworks.com/' },
              about: { type: 'string', example: 'Communities made for people magic. Nearly $500M in creator earnings on Mighty.' },
              followers: { type: 'number', example: 39634 },
              headquarters: { type: 'string', example: 'Palo Alto, California' },
              founded: { type: 'string', example: '2017' },
              industries: { type: 'array', items: { type: 'string' }, example: ['Technology', 'Information and Internet'] },
              funding: { type: 'object', example: { last_round_type: 'Series B', last_round_raised: 'US$ 50.0M' } },
              updates: { type: 'array', description: 'Recent company posts and updates' },
              employees: { type: 'array', description: 'Employee profiles and information' }
            }
          }
        },
        saved_count: { type: 'number', example: 1 },
        snapshot_id: { type: 'string', example: 's_mdbr9ydd1l1ey817fr' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body or URL format'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during data collection'
  })
  async collectCompanyInfo(@Body() companyUrlDto: CompanyUrlDto) {
    return this.companyInfoCollectService.collectCompanyInfo(companyUrlDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all collected company information',
    description: 'Retrieve all company information records from database'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved company information records'
  })
  async findAll() {
    return this.companyInfoCollectService.findAll();
  }

  @Get('company/:companyId')
  @ApiOperation({
    summary: 'Get company information by company ID',
    description: 'Retrieve company information by LinkedIn company ID'
  })
  @ApiParam({ name: 'companyId', description: 'LinkedIn company identifier' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved company information'
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found'
  })
  async findByCompanyId(@Param('companyId') companyId: string) {
    return this.companyInfoCollectService.findByCompanyId(companyId);
  }

  @Get('url/:encodedUrl')
  @ApiOperation({
    summary: 'Get company information by original URL',
    description: 'Retrieve company information by original LinkedIn URL (URL encoded)'
  })
  @ApiParam({ name: 'encodedUrl', description: 'URL encoded LinkedIn company URL' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved company information records'
  })
  async findByUrl(@Param('encodedUrl') encodedUrl: string) {
    const url = decodeURIComponent(encodedUrl);
    return this.companyInfoCollectService.findByUrl(url);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get company information by record ID',
    description: 'Retrieve specific company information by database record ID'
  })
  @ApiParam({ name: 'id', description: 'Database record ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved company information'
  })
  @ApiResponse({
    status: 404,
    description: 'Company information record not found'
  })
  async findOne(@Param('id') id: string) {
    return this.companyInfoCollectService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete company information record',
    description: 'Delete a specific company information record by ID'
  })
  @ApiParam({ name: 'id', description: 'Database record ID to delete' })
  @ApiResponse({ 
    status: 200, 
    description: 'Successfully deleted company information record' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Company information record not found' 
  })
  async remove(@Param('id') id: string) {
    const deleted = await this.companyInfoCollectService.remove(id);
    return {
      success: deleted,
      message: deleted ? 'Company information deleted successfully' : 'Company information not found'
    };
  }
}
