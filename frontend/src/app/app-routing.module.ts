/**
 * Módulo de Roteamento da Aplicação
 * Define as rotas principais e carrega os componentes de página correspondentes
 */
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent }        from './paginas/dashboard/dashboard.component';
import { NovaAssinaturaComponent }   from './paginas/nova-assinatura/nova-assinatura.component';
import { DetalhesAssinaturaComponent } from './paginas/detalhes-assinatura/detalhes-assinatura.component';

// Definição das rotas da aplicação
const rotas: Routes = [
  // Rota raiz redireciona para o dashboard
  { path: '',              redirectTo: 'dashboard', pathMatch: 'full' },

  // Tela principal com resumo financeiro e lista de assinaturas
  { path: 'dashboard',     component: DashboardComponent },

  // Formulário para cadastrar uma nova assinatura
  { path: 'nova-assinatura', component: NovaAssinaturaComponent },

  // Tela de detalhes e edição de uma assinatura específica
  { path: 'assinatura/:id', component: DetalhesAssinaturaComponent },

  // Qualquer rota desconhecida volta para o dashboard
  { path: '**',            redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(rotas)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
