/**
 * Módulo Raiz da Aplicação (AppModule)
 * Declara todos os componentes e importa os módulos necessários
 */
import { NgModule }              from '@angular/core';
import { BrowserModule }         from '@angular/platform-browser';
import { HttpClientModule }      from '@angular/common/http';
import { ReactiveFormsModule }   from '@angular/forms';
import { FormsModule }           from '@angular/forms';

import { AppRoutingModule }      from './app-routing.module';

// Componente raiz
import { AppComponent }          from './app.component';

// Páginas (routed components)
import { DashboardComponent }           from './paginas/dashboard/dashboard.component';
import { NovaAssinaturaComponent }      from './paginas/nova-assinatura/nova-assinatura.component';
import { DetalhesAssinaturaComponent }  from './paginas/detalhes-assinatura/detalhes-assinatura.component';

// Componentes reutilizáveis
import { CardAssinaturaComponent }  from './componentes/card-assinatura/card-assinatura.component';
import { GraficoGastosComponent }   from './componentes/grafico-gastos/grafico-gastos.component';

@NgModule({
  declarations: [
    AppComponent,

    // Páginas
    DashboardComponent,
    NovaAssinaturaComponent,
    DetalhesAssinaturaComponent,

    // Componentes reutilizáveis
    CardAssinaturaComponent,
    GraficoGastosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,      // Para as chamadas HTTP à API REST
    ReactiveFormsModule,   // Para formulários reativos (validações)
    FormsModule,           // Para two-way binding com ngModel
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
