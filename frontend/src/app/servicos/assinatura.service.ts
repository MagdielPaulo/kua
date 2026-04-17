/**
 * Serviço de Assinaturas
 * Responsável por todas as chamadas HTTP à API REST do backend.
 * Injeta o HttpClient e expõe métodos que retornam Observables.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Assinatura } from '../modelos/assinatura.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root', // Disponível como singleton em toda a aplicação
})
export class AssinaturaService {

  // URL base da API definida nas variáveis de ambiente
  private readonly urlBase = `${environment.apiUrl}/assinaturas`;

  constructor(private http: HttpClient) {}

  // ─────────────────────────────────────────────────────────
  // GET /api/assinaturas
  // Retorna todas as assinaturas cadastradas
  // ─────────────────────────────────────────────────────────
  listarTodas(): Observable<Assinatura[]> {
    return this.http
      .get<Assinatura[]>(this.urlBase)
      .pipe(catchError(this.tratarErro));
  }

  // ─────────────────────────────────────────────────────────
  // GET /api/assinaturas/:id
  // Retorna uma assinatura específica pelo ID
  // ─────────────────────────────────────────────────────────
  buscarPorId(id: number): Observable<Assinatura> {
    return this.http
      .get<Assinatura>(`${this.urlBase}/${id}`)
      .pipe(catchError(this.tratarErro));
  }

  // ─────────────────────────────────────────────────────────
  // POST /api/assinaturas
  // Cria uma nova assinatura e retorna o objeto criado
  // ─────────────────────────────────────────────────────────
  criar(assinatura: Assinatura): Observable<Assinatura> {
    return this.http
      .post<Assinatura>(this.urlBase, assinatura)
      .pipe(catchError(this.tratarErro));
  }

  // ─────────────────────────────────────────────────────────
  // PUT /api/assinaturas/:id
  // Atualiza os dados de uma assinatura existente
  // ─────────────────────────────────────────────────────────
  atualizar(id: number, assinatura: Assinatura): Observable<Assinatura> {
    return this.http
      .put<Assinatura>(`${this.urlBase}/${id}`, assinatura)
      .pipe(catchError(this.tratarErro));
  }

  // ─────────────────────────────────────────────────────────
  // DELETE /api/assinaturas/:id
  // Remove uma assinatura permanentemente
  // ─────────────────────────────────────────────────────────
  deletar(id: number): Observable<{ mensagem: string; assinatura: Assinatura }> {
    return this.http
      .delete<{ mensagem: string; assinatura: Assinatura }>(`${this.urlBase}/${id}`)
      .pipe(catchError(this.tratarErro));
  }

  // ─────────────────────────────────────────────────────────
  // Tratamento centralizado de erros HTTP
  // Formata a mensagem de erro antes de propagar ao componente
  // ─────────────────────────────────────────────────────────
  private tratarErro(erro: HttpErrorResponse): Observable<never> {
    let mensagem = 'Ocorreu um erro inesperado.';

    if (erro.status === 0) {
      // Sem conexão com o servidor
      mensagem = 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.';
    } else if (erro.status === 404) {
      mensagem = 'Assinatura não encontrada.';
    } else if (erro.status === 400) {
      mensagem = erro.error?.erro || 'Dados inválidos. Verifique os campos.';
    } else if (erro.status >= 500) {
      mensagem = 'Erro interno no servidor. Tente novamente mais tarde.';
    }

    console.error(`[AssinaturaService] Erro ${erro.status}:`, erro);
    return throwError(() => new Error(mensagem));
  }
}
