import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Servicio } from '../models';
@Injectable({ providedIn: 'root' })
export class ServiciosService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/servicios';
  listar(params: Record<string, string> = {}) {
    return this.http.get<Servicio[]>(this.url, { params });
  }
  obtener(id: number) {
    return this.http.get<Servicio>(this.url + '/' + id);
  }
  crear(data: unknown) {
    return this.http.post<Servicio>(this.url, data);
  }
  editar(id: number, data: unknown) {
    return this.http.put<void>(this.url + '/' + id, data);
  }
  eliminar(id: number) {
    return this.http.delete<void>(this.url + '/' + id);
  }
  estado(id: number, activo: boolean) {
    return this.http.patch<Servicio>(this.url + '/' + id + '/estado', { activo });
  }
}
