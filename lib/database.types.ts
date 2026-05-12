// Re-exports from the new Drizzle schema for backward compatibility.
// Components that import from here will continue to work unchanged.
export type {
  User as Profile,
  Request,
  RequestComment,
  RequestTask,
  RequestStage,
  RequestType,
  RequestStatus,
  RequestTaskStatus,
} from "./schema";
