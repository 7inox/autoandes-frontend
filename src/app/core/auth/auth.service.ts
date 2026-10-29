import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Sesion {
  token: string;
  tipo: string;
  expiraEnSegundos: number;
  nombreCompleto: string;
  roles: string[];
  permisos: string[];
  vence: number;
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private timer: ReturnType<typeof setTimeout> | undefined;
  readonly sesion = signal<Sesion | null>(null);
  readonly autenticado = computed(() => !!this.sesion());
  constructor() {
    try {
      const s = JSON.parse(sessionStorage.getItem('autoandes.sesion') || 'null') as Sesion | null;
      if (s && s.vence > Date.now()) {
        this.sesion.set(s);
        this.programar(s.vence);
      } else sessionStorage.removeItem('autoandes.sesion');
    } catch {
      sessionStorage.removeItem('autoandes.sesion');
    }
  }
  login(username: string, password: string) {
    return this.http
      .post<Omit<Sesion, 'vence'>>(environment.apiUrl + '/auth/login', { username, password })
      .pipe(
        tap((r) => {
          const s = { ...r, vence: Date.now() + r.expiraEnSegundos * 1000 };
          sessionStorage.setItem('autoandes.sesion', JSON.stringify(s));
          this.sesion.set(s);
          this.programar(s.vence);
        }),
      );
  }
  tiene(p: string) {
    return this.sesion()?.permisos.includes(p) ?? false;
  }
  private programar(vence: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.salir(this.router.url), Math.max(0, vence - Date.now()));
  }
  salir(returnUrl?: string) {
    clearTimeout(this.timer);
    this.sesion.set(null);
    sessionStorage.removeItem('autoandes.sesion');
    void this.router.navigate(['/login'], { queryParams: returnUrl ? { returnUrl } : undefined });
  }
  token() {
    try {
      const s = JSON.parse(sessionStorage.getItem('autoandes.sesion') || 'null') as Sesion | null;
      return s?.vence && s.vence > Date.now() ? s.token : null;
    } catch {
      return null;
    }
  }
}
