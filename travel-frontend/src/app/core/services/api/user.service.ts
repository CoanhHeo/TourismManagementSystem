import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { User } from '../../../shared/models/interfaces';

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = `${environment.apiUrl}/users`;
  
  constructor(private http: HttpClient) {}
  
  getAll() { 
    return this.http.get<User[]>(this.base); 
  }
}