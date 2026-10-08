/**
==========================================================
AURA Trade OS
Dependency Container
Version : 0.2.0 Alpha
==========================================================
Dependency Injection Container
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type ServiceFactory<T> =

    () => T;





/*
==========================================================
Dependency Container
==========================================================
*/

export class DependencyContainer {

    private readonly services =

        new Map<string, unknown>();



    private readonly factories =

        new Map<

            string,

            ServiceFactory<unknown>

        >();





    /*
    ======================================================
    Register Instance
    ======================================================
    */

    public register<T>(

        name: string,

        instance: T,

    ): void {

        if (

            this.services.has(name)

        ) {

            logger.warn(

                `Service "${name}" already registered.`,

            );



            return;

        }



        this.services.set(

            name,

            instance,

        );



        logger.debug(

            `Registered service "${name}".`,

        );

    }





    /*
    ======================================================
    Register Factory
    ======================================================
    */

    public registerFactory<T>(

        name: string,

        factory: ServiceFactory<T>,

    ): void {

        this.factories.set(

            name,

            factory,

        );



        logger.debug(

            `Registered factory "${name}".`,

        );

    }





    /*
    ======================================================
    Resolve
    ======================================================
    */

    public resolve<T>(

        name: string,

    ): T {

        if (

            this.services.has(name)

        ) {

            return this.services.get(

                name,

            ) as T;

        }



        const factory =

            this.factories.get(name);



        if (factory) {

            const instance =

                factory();



            this.services.set(

                name,

                instance,

            );



            return instance as T;

        }



        throw new Error(

            `Service "${name}" not found.`,

        );

    }





    /*
    ======================================================
    Exists
    ======================================================
    */

    public has(

        name: string,

    ): boolean {

        return (

            this.services.has(name) ||

            this.factories.has(name)

        );

    }





    /*
    ======================================================
    Remove
    ======================================================
    */

    public remove(

        name: string,

    ): void {

        this.services.delete(name);

        this.factories.delete(name);

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.services.clear();

        this.factories.clear();

    }





    /*
    ======================================================
    Count
    ======================================================
    */

    public size(): number {

        return (

            this.services.size +

            this.factories.size

        );

    }





    /*
    ======================================================
    Services
    ======================================================
    */

    public list(): string[] {

        const names =

            new Set<string>();



        this.services.forEach(

            (_,

            key) =>

                names.add(key),

        );



        this.factories.forEach(

            (_,

            key) =>

                names.add(key),

        );



        return [

            ...names,

        ].sort();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const dependencyContainer =

    new DependencyContainer();

