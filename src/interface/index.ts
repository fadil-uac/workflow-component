export interface IWorkflow {
  DATA_TYPE: string;
  states: { [key: string]: IState };
  SK: string;
  PK: string;
  ID: string;
  transitions: { [key: string]: ITransition[] };
  flags: string[];
  initialState: string;
}

export interface IState {
  preActions?: { [key: string]: any };
  label: string;
  finalState: boolean;
  tasks?: { [key: string]: any };
  data?: { [key: string]: any };
}

export interface ITransition {
  nextState: string;
  requiredTasks?: string[];
  requiredFlags?: IRequiredFlags;
}

export interface IRequiredFlags {
  flags: string[];
  type: string;
}

export interface IWorkflowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state?: IState;
}

export interface IWorkflowTransition {
  id: string;
  source: string;
  target: string;
}

export interface IWorkflowGraphData {
  nodes: IWorkflowNode[];
  transitions: IWorkflowTransition[];
}
