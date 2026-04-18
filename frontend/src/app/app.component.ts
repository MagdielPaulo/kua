import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { ConfiguracaoService } from './servicos/configuracao.service';

@Component({
  selector:    'app-root',
  templateUrl: './app.component.html',
  styleUrls:   ['./app.component.css'],
})
export class AppComponent implements OnInit {
  sidebarCollapsed  = false;
  menuMobileAberto  = false;

  constructor(
    private router: Router,
    private configuracaoService: ConfiguracaoService,
  ) {}

  ngOnInit(): void {
    this.configuracaoService.aplicarTema(this.configuracaoService.tema);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.menuMobileAberto = false;
        const sidebar = document.querySelector('.sidebar');
        sidebar?.classList.remove('mobile-open');
      });

    const saved = localStorage.getItem('kua_sidebar_collapsed');
    if (saved !== null) this.sidebarCollapsed = saved === 'true';
  }

  alternarSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('kua_sidebar_collapsed', String(this.sidebarCollapsed));
  }

  alternarMenuMobile(): void {
    this.menuMobileAberto = !this.menuMobileAberto;
    const sidebar = document.querySelector('.sidebar');
    sidebar?.classList.toggle('mobile-open', this.menuMobileAberto);
  }
}
