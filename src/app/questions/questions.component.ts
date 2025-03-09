import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';
import { DataShareService } from '../services/data-share.service';
import { GenerarPreguntasService } from '../services/generar-preguntas.service'; // Importar el servicio
import { trigger, transition, animate, style } from '@angular/animations';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // IMPORTANTE: Aquí agregamos BrowserAnimationsModule
import { ActivatedRoute, Router } from '@angular/router';

// Modelo para las preguntas
interface Question {
  pregunta: string;
  respuesta: string;
  options?: any; // Se generarán dinámicamente
  answered?: number; // Controla si ya se respondió la pregunta
  selectedAnswer?: string;
}

@Component({
    selector: 'app-questions',
    imports: [CommonModule, FormsModule],
    templateUrl: './questions.component.html',
    styleUrl: './questions.component.css'
})
export class QuestionsComponent implements OnInit{

  constructor(private DataShare: DataShareService, private generarPreguntasService: GenerarPreguntasService,  private router: Router, private route: ActivatedRoute,) {}

  textoRecibido: any;
  loading: boolean = false;
  viewResults:boolean = false
  displayedQuestions: Question[] = [];
  currentQuestionIndex = 0;
  displayedQuestion?: Question;
  questions: Question[] = []
  quizId: string | null = null;
  numPreguntas = 1

  ngOnInit(): void {


    this.route.paramMap.subscribe(params => {
      this.quizId = params.get('id'); // Obtener el ID de la URL (puede ser null)
      
      // Verificar si hay un ID válido y obtener el quiz
      if (this.quizId) {
        let quiz = this.getQuizIdFromLocalStorage(this.quizId)
        if(quiz){
          this.questions = quiz['questions']
          this.numPreguntas=this.questions.length
          this.loadNextQuestion()
        } else{
          console.log('id no tiene questions')
          this.router.navigate(['/home'])
        }
        
      } else {
        console.warn("No se proporcionó un ID en la URL.");
      }
    });
    
    
    
   


    
    
    

  }

  // Agregar el nuevo quiz al localStorage
  // addQuizToLocalStorage(): void {
  //   const newQuiz = { id: this.quizId, questions: this.questions, timestamp: new Date() };
  //   let quizzes = this.getQuizzesFromLocalStorage(); // Recuperar quizzes previos
  //   quizzes.push(newQuiz);
  //   localStorage.setItem('quizzes', JSON.stringify(quizzes));
  // }


  // Recuperar quizzes almacenados en localStorage
  getQuizzesFromLocalStorage(): any[] {
    const storedQuizzes = localStorage.getItem('quizzes');
    return storedQuizzes ? JSON.parse(storedQuizzes) : [];
  }

  getQuizIdFromLocalStorage(id:string){
    const quizzes = this.getQuizzesFromLocalStorage()
    const quiz = quizzes.find((quiz: any) => quiz.id === id);
    if(quiz){
      return quiz
    }

    return false
  }


  

  loadNextQuestion() {
    if (this.currentQuestionIndex < this.questions.length) {
      this.displayedQuestion = this.questions[this.currentQuestionIndex];
    } else {
      this.displayedQuestion = undefined; // No más preguntas
      this.viewResults = true
      
    }
    this.currentQuestionIndex++;
  }
  

  seleccionarRespuesta(option: string): void {
    if (!this.displayedQuestion || this.displayedQuestion.selectedAnswer) return;
    this.displayedQuestion.selectedAnswer = option;
    this.displayedQuestion.answered = 1;

    this.updateQuizLocalstorage(option, 1)
  }

  updateQuizLocalstorage(option:string, answered:number){
    const storedQuizzes = localStorage.getItem('quizzes');
    if (storedQuizzes) {
      let quizzes = JSON.parse(storedQuizzes);

      // Encontrar el quiz actual por su ID
      const quizIndex = quizzes.findIndex((quiz: any) => quiz.id === this.quizId);
      if (quizIndex !== -1) {
        // Actualizar la pregunta dentro del quiz
        const questionIndex = this.questions.findIndex(q => q.pregunta === this.displayedQuestion?.pregunta);
        if (questionIndex !== -1) {
          quizzes[quizIndex].questions[questionIndex].selectedAnswer = option;
          quizzes[quizIndex].questions[questionIndex].answered = answered;
        }

        // Guardar el quiz actualizado en `localStorage`
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
      }
    }
  }


  obtenerResultados(): { correctas: number, total: number } {
    let correctas = this.questions.filter(q => q.selectedAnswer === q.respuesta).length;
    return { correctas, total: this.questions.length };
  }


  splitTextIntoChunks(text: string, chunkSize: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }


  redirectHome(){
    this.router.navigate(['/home'])
  }
}






// { pregunta: '¿Qué tipo de algoritmos y modelos matemáticos se usan para procesar grandes cantidades de datos?', respuesta: 'algoritmos y modelos matemáticos', options: ['algoritmos y modelos matemáticos', 'modelos de probabilidad bayesiana', 'algoritmos de aprendizaje automático'], answered: 0, selectedAnswer: '' },
//     { pregunta: '¿Cuál es la base del aprendizaje supervisado?', respuesta: 'Conjunto de datos etiquetados', options: ['Redes neuronales profundas', 'Conjunto de datos etiquetados', 'Aprendizaje reforzado'], answered: 0, selectedAnswer: '' },
//     { pregunta: '¿Qué técnica es usada para reducir la dimensionalidad de los datos?', respuesta: 'Análisis de Componentes Principales', options: ['Análisis de Componentes Principales', 'Regresión Lineal', 'Redes Generativas Adversarias'], answered: 0, selectedAnswer: '' },
//     { pregunta: '¿Cuál es un ejemplo de modelo de lenguaje natural?', respuesta: 'Transformers', options: ['Árboles de decisión', 'Transformers', 'Algoritmos genéticos'], answered: 0, selectedAnswer: '' }


































// import { CommonModule } from '@angular/common';
// import { Component, OnInit } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import * as pdfjsLib from 'pdfjs-dist';
// import { DataShareService } from '../services/data-share.service';
// import { GenerarPreguntasService } from '../services/generar-preguntas.service'; // Importar el servicio
// import { trigger, transition, animate, style } from '@angular/animations';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // IMPORTANTE: Aquí agregamos BrowserAnimationsModule

// // Modelo para las preguntas
// interface Question {
//   pregunta: string;
//   respuesta: string;
//   options?: any; // Se generarán dinámicamente
//   answered?: number; // Controla si ya se respondió la pregunta
//   selectedAnswer?: string;
// }

// @Component({
//   selector: 'app-questions',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './questions.component.html',
//   styleUrl: './questions.component.css',
// })
// export class QuestionsComponent implements OnInit{

//   constructor(private DataShare: DataShareService, private generarPreguntasService: GenerarPreguntasService) {}

//   textoRecibido: any;
//   loading: boolean = false;
//   viewResults:boolean = false
//   displayedQuestions: Question[] = [];
//   currentQuestionIndex = 0;
//   displayedQuestion?: Question;
//   // questions: Question[] = []
//   questions: Question[] = [
//     { pregunta: '¿Qué tipo de algoritmos y modelos matemáticos se usan para procesar grandes cantidades de datos?', respuesta: 'algoritmos y modelos matemáticos', options: ['algoritmos y modelos matemáticos', 'modelos de probabilidad bayesiana', 'algoritmos de aprendizaje automático'], answered: 0, selectedAnswer: '' },
//     { pregunta: '¿Cuál es la base del aprendizaje supervisado?', respuesta: 'Conjunto de datos etiquetados', options: ['Redes neuronales profundas', 'Conjunto de datos etiquetados', 'Aprendizaje reforzado'], answered: 0, selectedAnswer: '' },
//     { pregunta: '¿Qué técnica es usada para reducir la dimensionalidad de los datos?', respuesta: 'Análisis de Componentes Principales', options: ['Análisis de Componentes Principales', 'Regresión Lineal', 'Redes Generativas Adversarias'], answered: 0, selectedAnswer: '' },
//     { pregunta: '¿Cuál es un ejemplo de modelo de lenguaje natural?', respuesta: 'Transformers', options: ['Árboles de decisión', 'Transformers', 'Algoritmos genéticos'], answered: 0, selectedAnswer: ''}
//   ];

//   ngOnInit(): void {
//     this.loadNextQuestion()
//     // this.textoRecibido = this.DataShare.get_texto();
//     // this.sendTextToAPI()
//     // console.log(this.textoRecibido)
//   }

//   loadNextQuestion() {
//     if (this.currentQuestionIndex < this.questions.length) {
//       this.displayedQuestion = this.questions[this.currentQuestionIndex];
//     } else {
//       this.displayedQuestion = undefined; // No más preguntas
//       this.viewResults = true
//     }
//     this.currentQuestionIndex++;
//   }
  

//   seleccionarRespuesta(option: string): void {
//     if (!this.displayedQuestion || this.displayedQuestion.selectedAnswer) return;
//     this.displayedQuestion.selectedAnswer = option;
//     // this.currentQuestionIndex++;
//     // this.loadNextQuestion();
   
//   }


//   obtenerResultados(): { correctas: number, total: number } {
//     let correctas = this.questions.filter(q => q.selectedAnswer === q.respuesta).length;
//     return { correctas, total: this.questions.length };
//   }


//   splitTextIntoChunks(text: string, chunkSize: number): string[] {
//     const chunks = [];
//     for (let i = 0; i < text.length; i += chunkSize) {
//       chunks.push(text.slice(i, i + chunkSize));
//     }
//     return chunks;
//   }

//    // Enviar el texto a la API en bloques
//   async sendTextToAPI(): Promise<void> {
//     if (this.textoRecibido.trim()) {
//       this.loading = true;
//       this.questions = [];
//       const chunks = this.splitTextIntoChunks(this.textoRecibido, 2000);
      
//       // Enviar cada bloque a la API
//       for (let i = 0; i < chunks.length; i++) {
//         try {
//           const response = await this.generarPreguntasService.sendTextToAPI(chunks[i]).toPromise();
//           this.questions = [...this.questions, ...response]; // Agregar las preguntas al array
//           this.loadNextQuestion()
//         } catch (error) {
//           console.error('Error al enviar el texto a la API:', error);
//           alert('Hubo un error al enviar el texto a la API');
//         }
//       }

//       this.loading = false;
//     } else {
//       alert('Por favor, carga un archivo PDF primero.');
//     }
//   } 

  
  

// }

