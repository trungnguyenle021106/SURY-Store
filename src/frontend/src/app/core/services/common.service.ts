import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { WardListResponse } from '../models/common.models';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/commons`;

  // 1. Lấy danh sách Phường/Xã
  getWards(): Observable<WardListResponse> {
    return this.http.get<WardListResponse>(`${this.baseUrl}/wards`);
  }
}