import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  selector: 'app-header',
  template: `<header>
    <div>
      <span class="eyebrow">OPERACIONES / AUTOANDES</span>
      <p>Todo el taller, en un solo lugar.</p>
    </div>
    <div class="profile">
      <span class="avatar">{{ auth.sesion()?.nombreCompleto?.charAt(0) }}</span>
      <div>
        <strong>{{ auth.sesion()?.nombreCompleto }}</strong
        ><small>{{ auth.sesion()?.roles?.join(' · ') }}</small>
      </div>
      <button class="quiet" (click)="auth.salir()">Salir</button>
    </div>
  </header>`,
})
export class Header {
  auth = inject(AuthService);
}
