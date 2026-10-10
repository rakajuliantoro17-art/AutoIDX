/**
==========================================================
AURA Trade OS
Workflow Scheduler
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    Workflow,
} from "./workflow";


export interface ScheduledWorkflow {
    readonly id: string;

    readonly workflow:
        Workflow;

    readonly executeAt: number;

    readonly createdAt: number;
}


export class WorkflowScheduler {

    private readonly schedules:
        Map<
            string,
            ScheduledWorkflow
        > =
        new Map();


    public schedule(
        workflow: Workflow,
        executeAt: number,
        id?: string,
    ): string {

        const scheduleId =
            id ??
            createScheduleId();


        this.schedules.set(
            scheduleId,
            {
                id: scheduleId,
                workflow,
                executeAt,
                createdAt: Date.now(),
            },
        );


        return scheduleId;
    }


    public cancel(
        scheduleId: string,
    ): boolean {

        return this.schedules.delete(
            scheduleId,
        );
    }


    public getDue(
        now: number = Date.now(),
    ):
        readonly ScheduledWorkflow[] {

        return [
            ...this.schedules.values(),
        ]
            .filter(
                item =>
                    item.executeAt <= now,
            )
            .sort(
                (
                    left,
                    right,
                ) =>
                    left.executeAt -
                    right.executeAt,
            );
    }


    public remove(
        scheduleId: string,
    ): boolean {

        return this.schedules.delete(
            scheduleId,
        );
    }


    public clear(): void {
        this.schedules.clear();
    }


    public size(): number {
        return this.schedules.size;
    }
}


export function createScheduleId(): string {
    return [
        "schedule",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}


export default WorkflowScheduler;
