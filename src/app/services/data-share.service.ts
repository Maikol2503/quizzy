import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {

  questions_compartido:any = [];

  constructor() { }

  set_questions(questions:any){
    this.questions_compartido = questions // Guardamos el texto en memoria
  }

  get_questions():any{
    return this.questions_compartido // Devolvemos el texto guardado
  }

  clear_questions(){
    this.questions_compartido = "" // Limpiamos el texto cuando ya no se necesite
  }
}
