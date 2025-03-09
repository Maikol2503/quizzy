import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GenerarPreguntasService {
  private apiUrl = 'http://127.0.0.1:8000/generarpreguntas_2'; // URL de la API FastAPI

  constructor(private http: HttpClient) {}

  // Método para enviar el texto a la API
  sendTextToAPI(text: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { text: text }); // Cambiado "text" a "textarea" según el modelo esperado
  }
}

 