import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';
import { Sidebar } from './sidebar/sidebar';
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar],
  template: `<div class="shell">
    <app-sidebar />
    <div class="workspace">
      <app-header />
      <main><router-outlet /></main>
      <footer>AutoAndes · Información conectada a Oracle · Miguel Ángel Tinoco López</footer>
    </div>
  </div>`,
})
export class MainLayout {}
