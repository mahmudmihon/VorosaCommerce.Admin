import BaseService from './BaseService'
import type { PagedList } from '~/types/common/PagedList'
import type { DiscountDto, DiscountEntityDto, DiscountEntityMapDto, DiscountRuleCreateDto, DiscountRuleDeleteDto, DiscountRuleDto, UpsertDiscountDto } from '~/types/catalog/Discount'

const resource = '/api/v1/admin/discount'

class DiscountService {
  protected baseService: typeof BaseService

  constructor() {
    this.baseService = BaseService
  }

  async getDiscounts(params: Record<string, unknown>): Promise<PagedList<DiscountDto>> {
    return await this.baseService.get<PagedList<DiscountDto>>(`${resource}/list`, params)
  }

  async upsertDiscount(payload: UpsertDiscountDto): Promise<DiscountDto> {
    return await this.baseService.post<DiscountDto>(`${resource}/upsert`, payload)
  }

  async getDiscountById(id: string): Promise<DiscountDto> {
    return await this.baseService.get<DiscountDto>(`${resource}/${id}`)
  }

  async getDiscountEntities(params: Record<string, unknown>): Promise<PagedList<DiscountEntityDto>> {
    return await this.baseService.get<PagedList<DiscountEntityDto>>(`${resource}/entity/list`, params)
  }

  async mapDiscountEntities(payload: DiscountEntityMapDto): Promise<void> {
    await this.baseService.post(`${resource}/entity/map`, payload)
  }

  async addDiscountRule(payload: DiscountRuleCreateDto): Promise<void> {
    await this.baseService.post(`${resource}/rule`, payload)
  }

  async getDiscountRules(params: Record<string, unknown>): Promise<DiscountRuleDto[]> {
    return await this.baseService.get<DiscountRuleDto[]>(`${resource}/rule/list`, params)
  }

  async deleteDiscountRule(payload: DiscountRuleDeleteDto): Promise<void> {
    await this.baseService.delete(`${resource}/rule`, payload)
  }

  async deleteDiscountEntity(id: string): Promise<void> {
    await this.baseService.delete(`${resource}/entity/${id}`)
  }
}

export default new DiscountService()
