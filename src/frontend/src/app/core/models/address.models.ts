export interface CreateAddressRequest {
  receiverName: string;
  phoneNumber: string;
  street: string;
  ward: string; 
  isDefault: boolean;
}

export interface UpdateAddressRequest extends CreateAddressRequest {
}

export interface UserAddress {
  id: string;
  receiverName: string;
  phoneNumber: string;
  street: string;
  wardDescription: string; 
  city: string;
  fullAddress: string;
  isDefault: boolean;
}

export interface AddressListResponse {
  addresses: UserAddress[];
}