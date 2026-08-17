export interface RegisterData {
  restaurant_name: string;
  owner_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}