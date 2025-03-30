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
  explicacion:string;
  acerto:number;
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
  viewExplanation:boolean = false
  displayedQuestions: Question[] = [];
  currentQuestionIndex = 0;
  displayedQuestion?: Question;
  questions: Question[] = []
  quizId: string | null = null;
  numPreguntas = 1
  match:boolean=false;
  viewSummaryActivate:boolean=false;
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
      this.viewExplanation = false;
    } else {
      this.displayedQuestion = undefined; // No más preguntas
      this.viewResults = true
      
    }
    this.currentQuestionIndex++;
    console.log(this.questions)
  }
  

  seleccionarRespuesta(option: string): void {
    if (!this.displayedQuestion || this.displayedQuestion.selectedAnswer) return;
    this.displayedQuestion.selectedAnswer = option;
    this.displayedQuestion.answered = 1;
    this.displayedQuestion.acerto = option === this.displayedQuestion.respuesta ? 1 : 0; 
    this.updateQuizLocalstorage(option, 1, this.displayedQuestion.acerto)
  }

  updateQuizLocalstorage(option:string, answered:number, acerto:number){
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
          quizzes[quizIndex].questions[questionIndex].acerto = acerto;
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





































