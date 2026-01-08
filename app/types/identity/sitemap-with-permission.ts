import type { PermissionActionDto } from "./permission-action";
import type { SitemapNodeDto } from "./sitemap";

export type SitemapNodeWithPermissionDto = {
  UserId: string;
  RBACVersion: number;
  Nodes: SitemapNodeDto[];
  Permissions: PermissionActionDto[];
}
