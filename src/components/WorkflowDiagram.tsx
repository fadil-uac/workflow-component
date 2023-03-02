import { useMemo, useState } from 'react';
import {
  IWorkflow,
  IWorkflowGraphData,
  IWorkflowNode,
  IWorkflowTransition,
} from '../interface';
import { StateView } from './StateView';

import { Button } from 'antd';
import workflowDatas from '../assets/workflow.json';
import { GraphControl } from './GraphControl';
import { WorkflowGraph } from './WorkflowGraph';

export const WorkflowDiagram = () => {
  const [selectedNode, setSelectedNode] = useState<IWorkflowNode>();
  const [workflowGraphData, setWorkflowGraphData] =
    useState<IWorkflowGraphData>();
  const [distance, setDistance] = useState(100);

  const parseWorkflowData = (): IWorkflowGraphData => {
    const workflowData: IWorkflow = workflowDatas[0] as any;

    const nodes: IWorkflowNode[] = Object.entries(workflowData.states).map(
      ([key, value]) => {
        return {
          id: key,
          label: value.label,
          x: 10,
          y: 10,
          state: value,
        };
      }
    );

    let transitions: IWorkflowTransition[] = [];

    Object.entries(workflowData.transitions).forEach(([key, value]) => {
      value.forEach((v, index) => {
        const targetId = nodes.find((node) => node.id === v.nextState)?.id;

        if (targetId) {
          transitions.push({
            id: `e-${key}-${index}`,
            source: key,
            target: targetId,
          });
        }
      });
    });

    return {
      nodes,
      transitions,
    };
  };

  const workflowDataParsed = useMemo(() => parseWorkflowData(), []);

  const filterWorkflowParsed = useMemo(
    () => workflowGraphData || workflowDataParsed,
    [workflowGraphData]
  );

  const handleFilterConnectedNodes = (node: IWorkflowNode) => {
    const connectedNodes = new Set<string>();
    const connectedTransitions = workflowDataParsed.transitions.filter(
      (t: any) => {
        if (t.source.id === node.id) {
          connectedNodes.add(t.target.id);
          return true;
        } else if (t.target.id === node.id) {
          connectedNodes.add(t.source.id);
          return true;
        } else {
          return false;
        }
      }
    );
    const filteredNodes = workflowDataParsed.nodes.filter((n) =>
      connectedNodes.has(n.id)
    );
    const filteredData = {
      nodes: [...filteredNodes, node],
      transitions: connectedTransitions,
    };

    setWorkflowGraphData(filteredData);
  };

  return (
    <div className="workflow-wrapper">
      <div className="workflow-container">
        <WorkflowGraph
          data={filterWorkflowParsed}
          distance={distance}
          onClickNode={setSelectedNode}
        />
        {selectedNode && (
          <StateView
            node={selectedNode}
            onClickOutside={() => setSelectedNode(undefined)}
            onFilterConnectedNodes={handleFilterConnectedNodes}
          />
        )}

        <GraphControl value={distance} onChange={setDistance} />

        <Button
          type="primary"
          style={{
            marginTop: '1rem',
            position: 'absolute',
            bottom: 20,
            right: 20,
          }}
          onClick={() => {
            setWorkflowGraphData(undefined);
          }}
        >
          Show all nodes
        </Button>
      </div>
    </div>
  );
};
