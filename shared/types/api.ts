export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export type ApiItemsResponse<T> = ApiResponse<{
  user?: {
    id: string;
    email: string;
  };
  items: T[];
}>;
