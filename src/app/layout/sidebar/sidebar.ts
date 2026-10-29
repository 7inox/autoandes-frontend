import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { menu } from '../../core/config/menu';
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `<aside>
    <a class="brand" routerLink="/servicios"
      ><span class="brand-icon">A</span>AutoAndes<span class="brand-small"
        >TALLER & SERVICIO</span
      ></a
    >
    <p class="nav-label">ÁREA DE TRABAJO</p>
    <nav>
      @for (item of menu; track item.ruta) {
        @if (auth.tiene(item.permiso)) {
          <a
            [routerLink]="item.ruta"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            >{{ item.texto }}<span>→</span></a
          >
        }
      }
    </nav>
    <div class="sidebar-footer">Gestión de taller<br /><small>LP2 · Versión A · 2026</small></div>
  </aside>`,
})
export class Sidebar {
  auth = inject(AuthService);
  menu = menu;
}
