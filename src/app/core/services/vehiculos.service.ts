import { Injectable,inject } from '@angular/core'; import { HttpClient } from '@angular/common/http'; import { environment } from '../../../environments/environment'; import { Vehiculo } from '../models';
 @Injectable({providedIn:'root'}) export class VehiculosService {private http=inject(HttpClient);private url=environment.apiUrl+'/vehiculos';
 listar(params:Record<string,string>={}){return this.http.get<Vehiculo[]>(this.url,{params});}
 obtener(id:number){return this.http.get<Vehiculo>(this.url+'/'+id);}
 crear(data:unknown){return this.http.post<Vehiculo>(this.url,data);}
 editar(id:number,data:unknown){return this.http.put<void>(this.url+'/'+id,data);}
 eliminar(id:number){return this.http.delete<void>(this.url+'/'+id);} 
 }
