export interface SitemapNode {
  Label: string
  Route?: string | null
  IconClass?: string | null
  ChildNodes?: SitemapNode[]
}
