import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AddressListResponse, CreateAddressRequest, UpdateAddressRequest, UserAddress } from '../models/address.models';
import { IdResponse, SuccessResponse } from '../models/core.models';


@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users/addresses`;

  // 1. Get List
  getAddresses(): Observable<AddressListResponse> {
    return this.http.get<AddressListResponse>(this.baseUrl);
  }

  // 2. Get By Id
  getAddressById(id: string): Observable<UserAddress> {
    return this.http.get<UserAddress>(`${this.baseUrl}/${id}`);
  }

  // 3. Create (Dùng CreateAddressRequest)
  createAddress(payload: CreateAddressRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(this.baseUrl, payload);
  }

  // 4. Update (Dùng UpdateAddressRequest)
  updateAddress(id: string, payload: UpdateAddressRequest): Observable<SuccessResponse> {
    return this.http.put<SuccessResponse>(`${this.baseUrl}/${id}`, payload);
  }

  // 5. Delete
  deleteAddress(id: string): Observable<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`${this.baseUrl}/${id}`);
  }

  // 6. Set Default
  setDefaultAddress(id: string): Observable<SuccessResponse> {
    return this.http.put<SuccessResponse>(`${this.baseUrl}/${id}/default`, {});
  }
}