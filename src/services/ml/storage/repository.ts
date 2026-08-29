/**
==========================================================
AURA Trade OS
ML Repository
Version : 0.2.0 Alpha

Perubahan dari 0.1.0: InMemoryRepository sendirian tidak cukup
untuk dipakai sungguhan -- state di memori hilang tiap kali
function serverless (Vercel) selesai merespons, jadi tidak
pernah benar-benar "menyimpan" apa pun antar-request. Tetap
dipertahankan di sini (berguna untuk testing/DI lokal), TAPI
sekarang ditambah FirestoreRepository<T> -- implementasi ASLI
yang benar-benar persisten, dipakai untuk mencatat riwayat
prediksi ML (lihat integrasi di src/pages/api/ml/predict.ts).
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

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

/**
 * Implementasi in-memory -- TIDAK bertahan antar-invocation
 * serverless. Dipertahankan untuk keperluan testing/DI lokal
 * SAJA -- JANGAN dipakai untuk fitur produksi apa pun.
 */
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

/**
 * Implementasi Firestore -- benar-benar persisten antar-
 * invocation serverless. `collectionName` dipisah per jenis
 * data (mis. "ml_predictions", "ml_experiments") supaya satu
 * kelas generik ini bisa dipakai ulang untuk berbagai
 * kebutuhan ML ke depan tanpa menulis kode Firestore baru
 * tiap kali.
 */
export class FirestoreRepository<T>
implements IRepository<T>{

    constructor(

        private readonly collectionName: string

    ){}

    private collection(){

        return adminDb.collection(this.collectionName);

    }

    async save(

        record:RepositoryRecord<T>

    ):Promise<void>{

        await this.collection().doc(record.id).set({
            ...record,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        });

    }

    async update(

        record:RepositoryRecord<T>

    ):Promise<void>{

        await this.save(record);

    }

    async delete(

        id:string

    ):Promise<boolean>{

        await this.collection().doc(id).delete();

        return true;

    }

    async find(

        id:string

    ):Promise<RepositoryRecord<T>|null>{

        const snapshot = await this.collection().doc(id).get();

        if (!snapshot.exists) {
            return null;
        }

        return this.deserialize(snapshot.data());

    }

    async findAll()

    :Promise<RepositoryRecord<T>[]>{

        const snapshot = await this.collection()
            .orderBy("createdAt", "desc")
            .limit(200)
            .get();

        return snapshot.docs.map((doc) => this.deserialize(doc.data()));

    }

    private deserialize(raw: any): RepositoryRecord<T> {

        return {
            id: raw.id,
            data: raw.data,
            createdAt: new Date(raw.createdAt),
            updatedAt: new Date(raw.updatedAt),
        };

    }

}

export default InMemoryRepository;
