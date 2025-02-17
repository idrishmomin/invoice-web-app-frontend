import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) { }

  login(requestBody: any): any {
    return this.httpClient.post(environment.loginUser, requestBody, {
      observe: 'response',
    });
  }
  createUser(request: any): any {
    return this.httpClient.post(environment.addUser, request);
  }
  getUsers(page: number, size: number): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    return this.httpClient.get<any>(environment.getUsersList, { params });
  }

  getUserDetails(email: any): Observable<any> {
    return this.httpClient.get<any>(environment.getUserDetails + '?email=' + email);
  }

  getAllUserList(): Observable<any> {
    return this.httpClient.get<any>(environment.getUsersListWithoutPagination);
  }

  updateUser(email: any, requestBody: any): Observable<any> {
    return this.httpClient.put<any>(environment.updateUser + '/' + email, requestBody);
  }

  changePassword(changePasswordRequest: any): Observable<any> {
    return this.httpClient.put(environment.changePassword, changePasswordRequest, {
      observe: 'response',
    });
  }
  adminChangePassword(changePasswordRequest: any) {
    const email = changePasswordRequest.email;  // Extract email from request body
    const url = `${environment.changePasswordAdmin}/${email}`;  // Construct URL with email as path variable
    return this.httpClient.put(url, changePasswordRequest, {
      observe: 'response'
    });
  }

} 
