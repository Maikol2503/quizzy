import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';
import { GenerarPreguntasService } from '../services/generar-preguntas.service'; // Importar el servicio
import { DataShareService } from '../services/data-share.service';
import { Router } from '@angular/router';
// Modelo para las preguntas
interface Question {
  pregunta: string;
  respuesta: string;
  options?: any; // Se generarán dinámicamente
  answered?: number; // Controla si ya se respondió la pregunta
  selectedAnswer?: string;
}

@Component({
    selector: 'app-file-uploader',
    imports: [CommonModule, FormsModule],
    templateUrl: './file-uploader.component.html',
    styleUrl: './file-uploader.component.css'
})
export class FileUploaderComponent {

  pdfText: string = 'Cargar un archivo PDF para ver su contenido...';
    questions: Question[] = []; // Se llenará con las preguntas de la API
    loading: boolean = false;
  
    constructor(private generarPreguntasService: GenerarPreguntasService, private router: Router, private dataShare:DataShareService) { 
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    }
  
    // Manejar carga de archivos PDF
    async onFileSelected(event: any): Promise<void> {
      const file = event.target.files[0];
      if (file) {
        this.pdfText = await this.extractTextFromPDF(file);
      }
    }
  
    // Extraer texto de un archivo PDF
    async extractTextFromPDF(file: File): Promise<string> {
      const pdfData = await file.arrayBuffer();
      const uint8Array = new Uint8Array(pdfData);
      const pdfDoc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
  
      let extractedText = '';
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        extractedText += pageText + '\n';
      }
      return extractedText;
    }
  
    // Función para dividir el texto en bloques de 2000 caracteres
    splitTextIntoChunks(text: string, chunkSize: number): string[] {
      const chunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
      }
      return chunks;
    }
  
    redirect(){
      this.dataShare.set_questions(this.pdfText)
      this.router.navigate(['/questions']);
    }

}
