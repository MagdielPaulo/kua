import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Assinatura } from '../modelos/assinatura.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssinaturaService {

  private readonly urlBase = `${environment.apiUrl}/assinaturas`;

  constructor(private http: HttpClient) {}

  listarTodas(): Observable<Assinatura[]> {
    return this.http.get<Assinatura[]>(this.urlBase).pipe(catchError(this.tratarErro));
  }

  buscarPorId(id: number): Observable<Assinatura> {
    return this.http.get<Assinatura>(`${this.urlBase}/${id}`).pipe(catchError(this.tratarErro));
  }

  criar(assinatura: Assinatura): Observable<Assinatura> {
    return this.http.post<Assinatura>(this.urlBase, assinatura).pipe(catchError(this.tratarErro));
  }

  atualizar(id: number, assinatura: Assinatura): Observable<Assinatura> {
    return this.http.put<Assinatura>(`${this.urlBase}/${id}`, assinatura).pipe(catchError(this.tratarErro));
  }

  deletar(id: number): Observable<{ mensagem: string; assinatura: Assinatura }> {
    return this.http
      .delete<{ mensagem: string; assinatura: Assinatura }>(`${this.urlBase}/${id}`)
      .pipe(catchError(this.tratarErro));
  }

  private tratarErro(erro: HttpErrorResponse): Observable<never> {
    const mensagens: Record<number, string> = {
      0:   'Não foi possível conectar ao servidor.',
      404: 'Assinatura não encontrada.',
      400: erro.error?.erro || 'Dados inválidos.',
    };
    const mensagem = mensagens[erro.status] ?? 'Erro interno no servidor.';
    return throwError(() => new Error(mensagem));
  }
}
