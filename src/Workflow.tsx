import { useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Connection,
  Edge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import { IState, ITransition, IWorkflow } from './interface';

import workflowData from './assets/workflow.json';

interface MyNodeType {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: {
    key?: string;
    transitions?: ITransition[];
  } & IState;
}

const nodeTypes = {
  custom: CustomNode,
};

export const Workflow = () => {
  const parseWorkflowData = (): [MyNodeType[], Edge<any>[]] => {
    const workflow: IWorkflow = workflowData[0] as any;

    const nodes: MyNodeType[] = Object.entries(workflow.states).map(
      ([key, value]) => {
        return {
          id: key,
          data: { ...value, transitions: workflow.transitions[key], key: key },
          position: { x: Math.random() * 500, y: Math.random() * 500 },
        };
      }
    );

    let edges: Edge[] = [];

    Object.entries(workflow.transitions).forEach(([key, value]) => {
      value.forEach((v, index) => {
        const targetId = nodes.find(
          (node) => node.data.key === v.nextState
        )?.id;
        if (targetId) {
          edges.push({
            id: `e-${key}-${index}`,
            source: key,
            target: targetId,

            type: 'straight',
          });
        }
      });
    });

    return [nodes, edges];
  };

  const workflowDataParsed = useMemo(() => parseWorkflowData(), []);

  const [nodes, , onNodesChange] = useNodesState(workflowDataParsed[0]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowDataParsed[1]);
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((els) => addEdge(params, els)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background />
    </ReactFlow>
  );
};
