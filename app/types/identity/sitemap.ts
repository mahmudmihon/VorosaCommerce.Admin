export type SitemapNodeDto = {
  Label: string
  Route?: string | null
  IconClass?: string | null
  ChildNodes?: SitemapNodeDto[]
}
