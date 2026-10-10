/**
==========================================================
AURA Trade OS
ML Archive Service
Version : 0.1.0 Alpha
==========================================================
*/

export type ArchiveType =

  | "MODEL"

  | "DATASET"

  | "EXPERIMENT"

  | "BACKTEST"

  | "FEATURES";

export interface ArchiveEntry {

  id:string;

  sourceId:string;

  type:ArchiveType;

  path:string;

  size:number;

  compressed:boolean;

  checksum?:string;

  createdAt:Date;

}

export class MLArchiveService {

  private archives:ArchiveEntry[]=[];

  /**
   * Register Archive
   */
  archive(

    entry:ArchiveEntry

  ):ArchiveEntry{

    this.archives.push(entry);

    return entry;

  }

  /**
   * List Archives
   */
  getAll():ArchiveEntry[]{

    return [...this.archives];

  }

  /**
   * Find Archive
   */
  find(

    id:string

  ){

    return this.archives.find(

      archive=>archive.id===id

    );

  }

  /**
   * Remove Archive
   */
  remove(

    id:string

  ):boolean{

    const index=

      this.archives.findIndex(

        archive=>archive.id===id

      );

    if(index<0){

      return false;

    }

    this.archives.splice(index,1);

    return true;

  }

  /**
   * Restore Placeholder
   */
  async restore(

    id:string

  ):Promise<boolean>{

    const archive=

      this.find(id);

    if(!archive){

      return false;

    }

    /**
     * Phase berikutnya:
     * unzip
     * checksum verification
     * restore registry
     */

    return true;

  }

}

const archiveService=

new MLArchiveService();

export default archiveService;
