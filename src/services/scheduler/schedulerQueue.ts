/**
==========================================================
AURA Trade OS
Scheduler Queue
Version : 0.3.0 Alpha
==========================================================
Execution Queue
==========================================================
*/

export interface SchedulerTask {

    readonly id: string;

    readonly priority: number;

    readonly execute:

        () => Promise<void>;

}





export class SchedulerQueue {

    private readonly queue:

        SchedulerTask[] = [];





    /*
    ======================================================
    Enqueue
    ======================================================
    */

    public enqueue(

        task: SchedulerTask,

    ): void {

        this.queue.push(

            task,

        );



        this.queue.sort(

            (

                a,

                b,

            ) =>

                b.priority -

                a.priority,

        );

    }





    /*
    ======================================================
    Dequeue
    ======================================================
    */

    public dequeue():

        SchedulerTask |

        undefined {

        return this.queue.shift();

    }





    /*
    ======================================================
    Peek
    ======================================================
    */

    public peek():

        SchedulerTask |

        undefined {

        return this.queue[0];

    }





    /*
    ======================================================
    Size
    ======================================================
    */

    public size():

        number {

        return this.queue.length;

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.queue.length = 0;

    }

}





export const schedulerQueue =

    new SchedulerQueue();


