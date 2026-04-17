import { NgModule }            from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { HttpClientModule }    from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule }         from '@angular/forms';

import { AppRoutingModule }    from './app-routing.module';

import { AppComponent }                  from './app.component';
import { DashboardComponent }            from './paginas/dashboard/dashboard.component';
import { AssinaturasComponent }          from './paginas/assinaturas/assinaturas.component';
import { NovaAssinaturaComponent }       from './paginas/nova-assinatura/nova-assinatura.component';
import { DetalhesAssinaturaComponent }   from './paginas/detalhes-assinatura/detalhes-assinatura.component';
import { PagamentosComponent }           from './paginas/pagamentos/pagamentos.component';
import { RelatoriosComponent }           from './paginas/relatorios/relatorios.component';
import { ConfiguracoesComponent }        from './paginas/configuracoes/configuracoes.component';
import { CardAssinaturaComponent }       from './componentes/card-assinatura/card-assinatura.component';
import { GraficoGastosComponent }        from './componentes/grafico-gastos/grafico-gastos.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    AssinaturasComponent,
    NovaAssinaturaComponent,
    DetalhesAssinaturaComponent,
    PagamentosComponent,
    RelatoriosComponent,
    ConfiguracoesComponent,
    CardAssinaturaComponent,
    GraficoGastosComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
