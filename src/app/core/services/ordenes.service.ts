import { Injectable,inject } from '@angular/core'; import { HttpClient } from '@angular/common/http'; import { environment } from '../../../environments/environment'; import { Orden } from '../models';
 @Injectable({providedIn:'root'}) export class OrdenesService {private http=inject(HttpClient);private url=environment.apiUrl+'/ordenes';
 listar(params:Record<string,string>={}){return this.http.get<Orden[]>(this.url,{params});}
 obtener(id:number){return this.http.get<Orden>(this.url+'/'+id);}
 crear(data:unknown){return this.http.post<Orden>(this.url,data);}
 editar(id:number,data:unknown){return this.http.put<void>(this.url+'/'+id,data);}
 eliminar(id:number){return this.http.delete<void>(this.url+'/'+id);} anular(id:number,motivo:string){return this.http.patch<Orden>(this.url+'/'+id+'/anular',{motivo});}
 }
