import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 


@Injectable({
  providedIn: 'root',
})
export class ApiModel {
  private  baseURL = environment.openRouterBaseUrl;
  private  apiKey = environment.openRouterApiKey;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/OpenRouterTeam/openrouter-examples',
    });
  }

  // Aquí el parámetro 'prompt' ahora es dinámico.
  getCompletion(prompt: string, model: string = "google/gemini-2.0-flash-lite-preview-02-05:free"): Observable<any> {
    const body = {
      model,
      messages: [{ role: 'user', content: prompt }],
    };
  
    return this.http.post(`${this.baseURL}/chat/completions`, body, { headers: this.getHeaders() });
  }

  // La función de 'streaming' sigue igual, pero puedes ajustar 'prompt' aquí también si lo deseas.
  async getStreamingCompletion(prompt: string, model: string = "google/gemini-2.0-flash-lite-preview-02-05:free"): Promise<void> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/OpenRouterTeam/openrouter-examples',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model,
        stream: true,
      }),
    });

    const reader = response.body?.getReader();
    if (reader) {
      const decoder = new TextDecoder('utf-8');
      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        console.log(result);
      }
    }
  }
}






