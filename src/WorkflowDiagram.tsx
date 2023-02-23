import * as d3 from 'd3';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import workflowData from './assets/workflow.json';
import { IState, IWorkflow } from './interface';

interface WorkflowNode {
  id: string;
  label: string;
  x: number;
  y: number;
  state?: IState;
}

interface WorkflowTransition {
  id: string;
  source: string;
  target: string;
}

interface WorkflowGraphData {
  nodes: WorkflowNode[];
  transitions: WorkflowTransition[];
}

interface Props {
  data: WorkflowGraphData;
  onClickNode(node: WorkflowNode): void;
}

const WorkflowGraph: React.FC<Props> = ({ data, onClickNode }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    const width = svg.attr('width');
    const height = svg.attr('height');

    const simulation = d3
      .forceSimulation<WorkflowNode>(data.nodes)
      .force(
        'link',
        d3
          .forceLink(data.transitions)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(Number(width) / 2, Number(height) / 2));

    const link = svg
      .append('g')
      .attr('id', 'c')
      .selectAll('line')
      .data<WorkflowTransition>(data.transitions)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d) => Math.sqrt(d.target.length));

    const node = svg
      .append('g')
      .attr('id', 'b')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data<WorkflowNode>(data.nodes)
      .enter()
      .append('circle')
      .attr('r', 36)
      .attr('fill', '#333');

    const label = svg
      .append('g')
      .attr('id', 'a')
      .selectAll('foreignObject')
      .data(data.nodes)
      .enter()
      .append('foreignObject')
      .attr('width', 60)
      .attr('height', 60)
      .html((d) => `<div class="node-label">${d.label}</div>`)
      .call(
        d3
          .drag<SVGForeignObjectElement, WorkflowNode>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', function (event: any, d: WorkflowNode) {
        const node = { ...d, x: event.pageX, y: event.pageY };
        onClickNode(node);
      });

    // define tick function
    simulation.on('tick', () => {
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      label.attr('x', (d) => d.x - 30).attr('y', (d) => d.y - 30);
    });

    return () => {
      simulation.stop();
    };
  }, [data]);

  return (
    <svg
      ref={svgRef}
      style={{ backgroundColor: '#eeeeee' }}
      width="1280"
      height="1080"
    ></svg>
  );
};

const StateView: React.FC<{ node: WorkflowNode }> = ({ node }) => {
  return (
    <div
      className="state-view"
      style={{
        position: 'absolute',
        left: node.x,
        top: node.y,
      }}
    >
      <div className="state-header">
        <div className="state-title">{node.label}</div>
        <div className="state-status">
          {node.state && node.state.finalState && 'Final'}
        </div>
      </div>

      {node.state && (
        <div className="state-content">
          {node.state.tasks && (
            <div className="tasks">
              <div className="content-title">Task:</div>
              <div className="content-list">
                {Object.entries(node.state.tasks).map(([key, value]) => (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      {key}({value['type']})
                    </div>
                    <div>{value['label']}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {node.state.data && (
            <div className="datas">
              <div className="content-title">Data:</div>
              <div className="content-list">
                {Object.entries(node.state.data).map(([key, value]) => (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'start',
                    }}
                  >
                    <div>
                      {key}({value['component']})
                    </div>
                    <div>{value['usage']}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const WorkflowDiagram = () => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode>();
  const stateViewRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(stateViewRef, () => {
    setSelectedNode(undefined);
  });

  const parseWorkflowData = (): WorkflowGraphData => {
    const workflow: IWorkflow = workflowData[0] as any;

    const nodes: WorkflowNode[] = Object.entries(workflow.states).map(
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

    let transitions: WorkflowTransition[] = [];

    Object.entries(workflow.transitions).forEach(([key, value]) => {
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

  return (
    <div className="workflow-container">
      <WorkflowGraph data={workflowDataParsed} onClickNode={setSelectedNode} />
      <div ref={stateViewRef}>
        {selectedNode && <StateView node={selectedNode} />}
      </div>
    </div>
  );
};
