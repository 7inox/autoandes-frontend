import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cliente } from '../models';
@Injectable({ providedIn: 'root' })
export class ClientesService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/clientes';
  listar(params: Record<string, string> = {}) {
    return this.http.get<Cliente[]>(this.url, { params });
  }
  obtener(id: number) {
    return this.http.get<Cliente>(this.url + '/' + id);
  }
  crear(data: unknown) {
    return this.http.post<Cliente>(this.url, data);
  }
  editar(id: number, data: unknown) {
    return this.http.put<void>(this.url + '/' + id, data);
  }
  eliminar(id: number) {
    return this.http.delete<void>(this.url + '/' + id);
  }
}
