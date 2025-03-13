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
    explicacion:string;
    acerto:number;
  }[];
}


@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  textInput: string = "La inteligencia artificial (IA) es una de las innovaciones tecnológicas más revolucionarias de la era moderna, con un impacto significativo en múltiples industrias y en la vida cotidiana de las personas. Se define como la capacidad de las máquinas y los sistemas informáticos para realizar tareas que tradicionalmente requerían inteligencia humana, como el aprendizaje, el razonamiento, la percepción y la toma de decisiones. Su desarrollo se basa en la combinación de algoritmos avanzados, redes neuronales, modelos de aprendizaje automático y grandes volúmenes de datos, lo que permite a las máquinas mejorar su rendimiento con el tiempo sin intervención humana directa. Existen diferentes tipos de inteligencia artificial, cada uno con niveles de complejidad y aplicaciones específicas. La IA débil o estrecha es la más común y se especializa en realizar tareas específicas, como los asistentes virtuales (Siri, Alexa, Google Assistant), los sistemas de recomendación en plataformas de streaming y comercio electrónico, o los algoritmos de detección de fraudes en transacciones bancarias. Por otro lado, la IA fuerte, también conocida como inteligencia general artificial (AGI, por sus siglas en inglés), busca emular la inteligencia humana en su totalidad, permitiendo a las máquinas comprender, razonar y resolver problemas en diferentes contextos sin restricciones predefinidas. Aunque la AGI aún es un concepto en desarrollo, los avances en el procesamiento del lenguaje natural y el aprendizaje profundo han acercado a la ciencia a esta meta.Uno de los campos más importantes dentro de la inteligencia artificial es el aprendizaje automático (machine learning), que permite a los sistemas mejorar su desempeño a partir de la experiencia. Dentro de esta disciplina, el aprendizaje supervisado utiliza datos etiquetados para entrenar modelos capaces de hacer predicciones, mientras que el aprendizaje no supervisado analiza patrones en grandes volúmenes de datos sin necesidad de etiquetas previas. También existe el aprendizaje por refuerzo, en el que un agente de IA interactúa con su entorno y aprende mediante recompensas o castigos, como en el caso de los algoritmos utilizados en la robótica y los videojuegos. En los últimos años, la inteligencia artificial ha impulsado avances en múltiples sectores. En la medicina, ha permitido desarrollar sistemas de diagnóstico basados en imágenes médicas, modelos predictivos para la detección temprana de enfermedades y algoritmos que personalizan tratamientos según el perfil genético de cada paciente. En el ámbito financiero, los sistemas de IA analizan tendencias del mercado y optimizan estrategias de inversión en tiempo real. En la industria automotriz, los vehículos autónomos emplean redes neuronales para procesar información del entorno y tomar decisiones de conducción con un alto nivel de precisión. ";
  textPdf: string = '';
  questions: Question[] = [];
  loading: boolean = false;
  OptionUploadText = 'contexto';
  questionLocalStorage:any = []
  data:any = []
  newQuizId:string = ""
  viewContenedorCofigGenQuiz:boolean = false
  numPreguntas: number = 10;



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
    let totalPreguntas = this.numPreguntas;
    let preguntasGeneradas: any[] = [];
    
    this.loading = true;
    this.viewContenedorCofigGenQuiz = false;
    
    let texto = this.OptionUploadText === 'contexto' ? this.textInput : this.pdfList.map(pdf => pdf.text).join('\n');
  
    while (preguntasGeneradas.length < totalPreguntas) {
      let faltan = totalPreguntas - preguntasGeneradas.length;
  
      let prompt = `
  Genera ${faltan} preguntas únicas basadas en el siguiente texto:
  
  - No repitas preguntas ya generadas.
  - Devuelve exclusivamente un objeto JSON válido, sin texto adicional.
  - Genera exactamente ${faltan} preguntas nuevas.
  - Cada pregunta debe incluir:
    - Una única respuesta correcta.
    - Exactamente tres respuestas incorrectas.
    - Una explicación detallada.
  
  Formato JSON esperado:
  
  [
    {
      "pregunta": "Pregunta",
      "respuesta_correcta": "Respuesta correcta",
      "respuestas_incorrectas": ["Incorrecta 1", "Incorrecta 2", "Incorrecta 3"],
      "explicacion": "Explicación detallada."
    }
  ]
  
  Texto base: ${texto}
  Preguntas ya generadas:
  ${JSON.stringify(preguntasGeneradas.map(p => p.pregunta))}
      `;
  
      const response = await this.modelo.getCompletion(prompt).toPromise();
      let jsonString = response.choices[0].message.content.trim();
  
      jsonString = jsonString.replace(/^```json|\n```$/g, '').trim();
      
      let nuevasPreguntas = JSON.parse(jsonString);
  
      // Filtrar preguntas repetidas
      nuevasPreguntas = nuevasPreguntas.filter((nueva:any) => 
        !preguntasGeneradas.some(existente => existente.pregunta === nueva.pregunta)
      );
  
      preguntasGeneradas = [...preguntasGeneradas, ...nuevasPreguntas];
    }
  
    this.loading = false;
  
    if (preguntasGeneradas.length > 0) {
      const quizId = this.generateQuizId();
      this.addQuizToLocalStorage(quizId, this.transformData(preguntasGeneradas));
      this.redirect(quizId);
    } else {
      alert('No se generaron suficientes preguntas. Inténtalo de nuevo.');
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
          explicacion: element.explicacion,
          acerto:0,
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