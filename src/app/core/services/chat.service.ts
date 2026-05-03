import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat/stream`;
  private sessionId = crypto.randomUUID();

  isProcessing = signal(false);
  chatHistory = signal<{ role: string, content: string }[]>([]);

  async submitQuery(query: string, context?: any): Promise<ReadableStream<Uint8Array> | null> {
    if (this.isProcessing()) return null;

    this.isProcessing.set(true);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': environment.apiKey
        },
        body: JSON.stringify({
          query,
          session_id: this.sessionId,
          action: 'chat',
          context: context || {}
        })
      });

      if (response.status === 429) {
        throw new Error('TOO_MANY_REQUESTS');
      }

      if (!response.ok) throw new Error('API_UNAVAILABLE');

      return response.body;
    } catch (error) {
      this.isProcessing.set(false);
      throw error;
    }
  }

  addToHistory(role: string, content: string) {
    this.chatHistory.update(history => {
      const newHistory = [...history, { role, content }];
      return newHistory.slice(-10);
    });
  }

  setProcessing(value: boolean) {
    this.isProcessing.set(value);
  }
}
