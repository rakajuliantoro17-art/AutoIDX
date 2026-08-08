/**
==========================================================
AURA Trade OS
Events Service
Version : 0.0.7 Alpha
==========================================================
Central Event System Barrel
==========================================================
*/


/*
==========================================================
 Core Event
==========================================================
*/

export {
    AURAEvent,
    createEventId,
    resolveEventCategory,
    isAURAEvent,
} from "./event";

export type {
    EventOptions,
    SerializedEvent,
} from "./event";


/*
==========================================================
 Event Type
==========================================================
*/

export {
    EventType,
} from "./eventType";


/*
==========================================================
 Event Category
==========================================================
*/

export {
    EventCategory,
} from "./eventCategory";


/*
==========================================================
 Event Priority
==========================================================
*/

export {
    EventPriority,
} from "./eventPriority";


/*
==========================================================
 Event Status
==========================================================
*/

export {
    EventStatus,
} from "./eventStatus";


/*
==========================================================
 Event Metadata
==========================================================
*/

export type {
    EventMetadata,
} from "./eventMetadata";

export {
    createEventMetadata,
} from "./eventMetadata";


/*
==========================================================
 Event Context
==========================================================
*/

export type {
    EventContext,
} from "./eventContext";

export {
    createEventContext,
} from "./eventContext";


/*
==========================================================
 Event Payload
==========================================================
*/

export type {
    EventPayload,
} from "./eventPayload";

export {
    isEventPayloadObject,
} from "./eventPayload";


/*
==========================================================
 Event Result
==========================================================
*/

export type {
    EventResult,
} from "./eventResult";

export {
    createEventResult,
    createFailedEventResult,
} from "./eventResult";


/*
==========================================================
 Event Handler
==========================================================
*/

export type {
    EventHandler,
    EventHandlerRegistration,
} from "./eventHandler";

export {
    createEventHandlerId,
} from "./eventHandler";


/*
==========================================================
 Event Subscriber
==========================================================
*/

export type {
    EventSubscriber,
} from "./eventSubscriber";

export {
    createSubscriberId,
} from "./eventSubscriber";


/*
==========================================================
 Event Publisher
==========================================================
*/

export type {
    EventPublisher,
    BatchEventPublisher,
} from "./eventPublisher";


/*
==========================================================
 Event Queue
==========================================================
*/

export {
    EventQueue,
} from "./eventQueue";


/*
==========================================================
 Event Registry
==========================================================
*/

export {
    EventRegistry,
} from "./eventRegistry";


/*
==========================================================
 Event Middleware
==========================================================
*/

export {
    EventMiddlewareChain,
} from "./eventMiddleware";

export type {
    EventMiddleware,
} from "./eventMiddleware";


/*
==========================================================
 Event Dispatcher
==========================================================
*/

export {
    EventDispatcher,
} from "./eventDispatcher";


/*
==========================================================
 Event Normalizer
==========================================================
*/

export {
    normalizeEvent,
    normalizeEventType,
    isEventType,
} from "./eventNormalizer";


/*
==========================================================
 Event Serializer
==========================================================
*/

export {
    EventSerializer,
} from "./eventSerializer";


/*
==========================================================
 Event Bus
==========================================================
*/

export {
    EventBus,
} from "./eventBus";


/*
==========================================================
 Event Manager
==========================================================
*/

export {
    EventManager,
    eventManager,
} from "./eventManager";
