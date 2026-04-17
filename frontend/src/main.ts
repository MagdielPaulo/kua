/**
 * Ponto de entrada da aplicação Angular
 * Inicializa a plataforma do browser e carrega o módulo raiz (AppModule)
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error('Erro ao inicializar o Kua:', err));
