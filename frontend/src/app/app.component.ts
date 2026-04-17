/**
 * Componente Raiz da Aplicação (AppComponent)
 * Renderiza a barra de navegação e o outlet das rotas filhas
 */
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector:    'app-root',
  templateUrl: './app.component.html',
  styleUrls:   ['./app.component.css'],
})
export class AppComponent {
  titulo = 'Ralo Tracker';

  // Controla se o menu mobile está aberto
  menuAberto = false;

  constructor(private router: Router) {
    // Fecha o menu ao navegar para outra rota
    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(() => {
        this.menuAberto = false;
      });
  }

  // Alterna o menu mobile
  alternarMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  // Navega para nova assinatura
  irParaNovaAssinatura(): void {
    this.router.navigate(['/nova-assinatura']);
  }
}
