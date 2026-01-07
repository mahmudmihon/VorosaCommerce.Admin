export interface PagedList<T> {
  PageIndex: number;
  PageSize: number;
  TotalCount: number;
  TotalPages: number;
  HasPreviousPage: boolean;
  HasNextPage: boolean;
  Items: T[];
}
