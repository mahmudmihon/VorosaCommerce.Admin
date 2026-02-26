export enum CampaignType {
  Email = 10,
  Sms = 20
}

export type CampaignInfoDto = {
  Id: string
  Type: CampaignType
  Name: string
  Subject?: string | null
  Body: string
  ScheduledDate?: string | null
}

export type UpsertCampaignInfoDto = {
  Id?: string
  Type: CampaignType
  Name: string
  Subject?: string | null
  Body: string
  ScheduledDate?: string | null
}