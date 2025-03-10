import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';

import { GenerarPreguntasService } from '../services/generar-preguntas.service';
import { DataShareService } from '../services/data-share.service';
import { Router } from '@angular/router';
import OpenAI from "openai"
import { ApiModel } from '../services/api-deepseek.service';



interface Question {
  id: string;
  questions: {
    pregunta: string;
    respuesta: string;
    options?: any;
    answered: number;
    selectedAnswer?: string;
  }[];
}


@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  textInput: string = "La inteligencia artificial (IA) es una de las innovaciones tecnológicas más revolucionarias de la era moderna, con un impacto significativo en múltiples industrias y en la vida cotidiana de las personas. Se define como la capacidad de las máquinas y los sistemas informáticos para realizar tareas que tradicionalmente requerían inteligencia humana, como el aprendizaje, el razonamiento, la percepción y la toma de decisiones. Su desarrollo se basa en la combinación de algoritmos avanzados, redes neuronales, modelos de aprendizaje automático y grandes volúmenes de datos, lo que permite a las máquinas mejorar su rendimiento con el tiempo sin intervención humana directa.";
  textPdf: string = '';
  questions: Question[] = [];
  loading: boolean = false;
  OptionUploadText = 'contexto';
  questionLocalStorage:any = []
  data:any = []
  newQuizId:string = ""

  



  // Arreglo para almacenar cada PDF cargado y su contenido extraído
  pdfList: { file: File; text: string }[] = [];

  constructor(
    private generarPreguntasService: GenerarPreguntasService,
    private router: Router,
    private dataShare: DataShareService,
    private modelo: ApiModel
  ) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
      
  }

  
  ngOnInit(): void {
   this.questionLocalStorage = this.getQuizzesFromLocalStorage()
  }

  generateQuizId(): string {
    return new Date().getTime().toString();
  }

  // Recuperar quizzes almacenados en localStorage
  getQuizzesFromLocalStorage(): any[] {
    const storedQuizzes = localStorage.getItem('quizzes');
    return storedQuizzes ? JSON.parse(storedQuizzes) : [];
  }

  // Maneja la carga de archivos PDF (permitiendo múltiples archivos)
  async onFileSelected(event: any): Promise<void> {
    const files: FileList = event.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await this.extractTextFromPDF(file);
      // Agrega el archivo y su texto extraído a la lista
      this.pdfList.push({ file, text });
    }
  }

  calculateQuizTime(timestamp: string | Date): string {
    const startTime = new Date(timestamp).getTime();
    const endTime = new Date().getTime();
    const elapsedTime = Math.floor((endTime - startTime) / 1000); // Convertir a segundos
  
    if (elapsedTime < 60) {
      return `${elapsedTime} segundos`;
    } else if (elapsedTime < 3600) { // Menos de 1 hora
      return `${Math.floor(elapsedTime / 60)} minutos`;
    } else if (elapsedTime < 86400) { // Menos de 24 horas
      return `${Math.floor(elapsedTime / 3600)} horas`;
    } else { // Más de un día
      return `${Math.floor(elapsedTime / 86400)} días`;
    }
  }
  
  // Función para extraer texto de un PDF
  async extractTextFromPDF(file: File): Promise<string> {
    console.log("rcfc")
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
  

  // Función para dividir el texto en bloques (si lo necesitas)
  splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  selectOptionUploadText(option: string) {
    this.OptionUploadText = option;
  }

  // Función para remover un PDF de la lista, dado su índice
  removePdf(index: number): void {
    this.pdfList.splice(index, 1);
  }

  deleteQuiz(quizId: string, event: Event): void {
    event.stopPropagation(); // Evita que el evento se propague y active `redirect()`
    // Mostrar alerta de confirmación antes de eliminar
    if (confirm('¿Estás seguro de que deseas eliminar este registro del historial? Esta acción no se puede deshacer.')) {
      let quizzes = this.getQuizzesFromLocalStorage();
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId); // Filtrar para eliminar
  
      localStorage.setItem('quizzes', JSON.stringify(updatedQuizzes)); // Guardar la nueva lista
      this.questionLocalStorage = updatedQuizzes; // Actualizar la lista en la vista
    }
  }
  
  async sendTextToAPI(): Promise<void> {
    let data:any = {}
    if (this.textInput.trim() || this.textPdf.trim()) {
      this.loading = true;
      let texto:any = "";
      if (this.OptionUploadText === 'contexto') {
        texto = this.textInput
      } else if (this.OptionUploadText === 'pdf') {
        texto = this.pdfList.map(pdf => pdf.text).join('\n')
      
      }

    let promt = `
      Genera 10 preguntas basadas en el siguiente texto, cumpliendo estrictamente estas instrucciones:
                          - La pregunta debe estar basada exclusivamente en el texto proporcionado.
                          - Devuelve únicamente un objeto JSON válido, sin ningún texto adicional.
                          - Debe generarse exactamente **10** preguntas.
                          - Cada pregunta debe incluir una única respuesta correcta.
                          - Cada pregunta debe incluir exactamente tres respuestas incorrectas.
                          - El objeto JSON debe seguir exactamente esta estructura:
  
                          [
                          {
                              "pregunta": "¿Pregunta?",
                              "respuesta_correcta": "Respuesta",
                              "respuestas_incorrectas": ["Incorrecta", "Incorrecta", "Incorrecta"]
                          },
                          ...
                          ]
  
                          Asegúrate de que:
                          - Se utilicen correctamente las comillas y comas propias del JSON.
                          - Se generen exactamente **dos preguntas**.
                          - No se incluya texto adicional fuera del JSON.
  
                          Texto base: ${texto} 
                          
                          `

      const response = await this.modelo.getCompletion(promt).toPromise();
      let jsonString = response.choices[0].message.content;

      // Limpiar el string eliminando cualquier formato Markdown (como ```json al principio y al final)
      jsonString = jsonString.replace(/^```json|\n```$/g, '').trim();
      // Ahora puedes analizarlo como JSON
      const jsonData = JSON.parse(jsonString);
      let questions = this.transformData(jsonData)
      this.loading = false
      // Verificar si se generaron preguntas y redirigir
      if (questions.length > 0) {
        const quizId = this.generateQuizId()
        this.addQuizToLocalStorage(quizId, questions)
        this.redirect(quizId);
      } else {
        alert('No se generaron preguntas. Verifica el texto de entrada.');
      }
    } else {
      alert('Por favor, carga un archivo PDF primero.');
    }
  }


  transformData(data: any) {
    let dataTranformada: any[] = [];
  
    // Función para mezclar arrays (Algoritmo Fisher-Yates)
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
  
    data.forEach((element: any) => {
      if (element?.pregunta && element?.respuesta_correcta && element?.respuestas_incorrectas) {
        // Crear array combinado y mezclado
        const opcionesMezcladas = shuffleArray([
          ...element.respuestas_incorrectas,
          element.respuesta_correcta
        ]);
  
        const preguntaTransformada = {
          answered: 0,
          options: opcionesMezcladas,  // Usamos el array mezclado
          pregunta: element.pregunta,
          respuesta: element.respuesta_correcta,
          selectedAnswer: "",
        };
  
        dataTranformada.push(preguntaTransformada);
      }
    });
  
    return dataTranformada;
  }
  
  addQuizToLocalStorage(quizId:string, questions:any): void {
    const newQuiz = { id: quizId, questions: questions, timestamp: new Date() };
    let quizzes = this.getQuizzesFromLocalStorage(); // Recuperar quizzes previos
    quizzes.push(newQuiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }

  redirect(id:string) {
    this.dataShare.set_questions(this.data)
    this.router.navigate(['/questions/'+id])
    
  }

}