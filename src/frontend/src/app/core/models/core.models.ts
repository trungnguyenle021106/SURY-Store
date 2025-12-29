export interface IdResponse {
  id: string;
}

export interface SuccessResponse {
  isSuccess: boolean;
}

export interface PaginatedResult<T> {
  pageIndex: number;
  pageSize: number;
  count: number;     
  data: T[];         
}

export interface SuccessWithMessageResponse extends SuccessResponse {
  message: string;
}