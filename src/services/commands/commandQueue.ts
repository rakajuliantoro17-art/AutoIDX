/**
==========================================================
AURA Trade OS
Command Queue
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    AURACommand,
} from "./command";


export class CommandQueue {

    private readonly items:
        AURACommand[] = [];


    public enqueue(
        command: AURACommand,
    ): void {

        command.markQueued();

        this.items.push(
            command,
        );

        this.sort();
    }


    public dequeue():
        AURACommand | undefined {

        return this.items.shift();
    }


    public peek():
        AURACommand | undefined {

        return this.items[0];
    }


    public remove(
        commandId: string,
    ): boolean {

        const index =
            this.items.findIndex(
                command =>
                    command.id ===
                    commandId,
            );


        if (index < 0) {
            return false;
        }


        this.items.splice(
            index,
            1,
        );

        return true;
    }


    public clear(): void {
        this.items.length = 0;
    }


    public size(): number {
        return this.items.length;
    }


    public isEmpty(): boolean {
        return this.items.length === 0;
    }


    public values():
        readonly AURACommand[] {

        return [
            ...this.items,
        ];
    }


    private sort(): void {

        this.items.sort(
            (
                left,
                right,
            ) => {

                if (
                    left.priority !==
                    right.priority
                ) {
                    return (
                        right.priority -
                        left.priority
                    );
                }


                return (
                    left.timestamp -
                    right.timestamp
                );
            },
        );
    }
}


export default CommandQueue;
