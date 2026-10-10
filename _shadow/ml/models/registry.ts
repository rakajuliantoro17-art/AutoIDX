/**
==========================================================
AURA Trade OS
ML Model Registry
Version : 0.1.0 Alpha
==========================================================
*/

import { TrainingAlgorithm } from "./trainer";

export interface ModelMetadata {

  id:string;

  name:string;

  version:string;

  algorithm:TrainingAlgorithm;

  accuracy:number;

  winRate:number;

  createdAt:Date;

  active:boolean;

}

export class ModelRegistry {

  private models:ModelMetadata[] = [];

  /**
   * Register New Model
   */
  register(

    metadata:ModelMetadata

  ):ModelMetadata{

    this.models.push(metadata);

    return metadata;

  }

  /**
   * Get All Models
   */
  getAll():ModelMetadata[]{

    return [...this.models];

  }

  /**
   * Get Active Model
   */
  getActive():

  ModelMetadata | undefined{

    return this.models.find(

      model=>model.active

    );

  }

  /**
   * Activate Model
   */
  activate(

    id:string

  ):boolean{

    const target =

      this.models.find(

        model=>model.id===id

      );

    if(!target){

      return false;

    }

    this.models.forEach(

      model=>{

        model.active=false;

      }

    );

    target.active=true;

    return true;

  }

  /**
   * Remove Model
   */
  remove(

    id:string

  ):boolean{

    const index =

      this.models.findIndex(

        model=>model.id===id

      );

    if(index<0){

      return false;

    }

    this.models.splice(index,1);

    return true;

  }

  /**
   * Find Model
   */
  find(

    id:string

  ){

    return this.models.find(

      model=>model.id===id

    );

  }

}

const modelRegistry =

new ModelRegistry();

export default modelRegistry;
