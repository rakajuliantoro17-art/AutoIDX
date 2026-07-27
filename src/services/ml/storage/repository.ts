/**
==========================================================
AURA Trade OS
ML Repository
Version : 0.1.0 Alpha
==========================================================
*/

export interface RepositoryRecord<T>{

    id:string;

    data:T;

    createdAt:Date;

    updatedAt:Date;

}

export interface IRepository<T>{

    save(record:RepositoryRecord<T>):Promise<void>;

    update(record:RepositoryRecord<T>):Promise<void>;

    delete(id:string):Promise<boolean>;

    find(id:string):Promise<RepositoryRecord<T>|null>;

    findAll():Promise<RepositoryRecord<T>[]>;

}

export class InMemoryRepository<T>
implements IRepository<T>{

    private storage=

    new Map<string,RepositoryRecord<T>>();

    async save(

        record:RepositoryRecord<T>

    ):Promise<void>{

        this.storage.set(

            record.id,

            record

        );

    }

    async update(

        record:RepositoryRecord<T>

    ):Promise<void>{

        this.storage.set(

            record.id,

            record

        );

    }

    async delete(

        id:string

    ):Promise<boolean>{

        return this.storage.delete(id);

    }

    async find(

        id:string

    ):Promise<RepositoryRecord<T>|null>{

        return this.storage.get(id)

        ?? null;

    }

    async findAll()

    :Promise<RepositoryRecord<T>[]>{

        return Array.from(

            this.storage.values()

        );

    }

}

export default InMemoryRepository;
