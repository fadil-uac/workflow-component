import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import {
  IWorkflowGraphData,
  IWorkflowNode,
  IWorkflowTransition,
} from '../interface';

type WorkflowGraphProps = {
  data: IWorkflowGraphData;
  onClickNode(node: IWorkflowNode): void;
};

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  data,
  onClickNode,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<
    IWorkflowNode,
    IWorkflowTransition
  > | null>(null);

  const [isDragged, setIsDragged] = useState(false);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);

    if (svg.size() > 0) {
      svg.selectAll('*').remove();
    }

    const width = svg.attr('width');
    const height = svg.attr('height');

    const simulation = d3
      .forceSimulation<IWorkflowNode>(data.nodes)
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
      .data<IWorkflowTransition>(data.transitions)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    const node = svg
      .append('g')
      .attr('id', 'b')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data<IWorkflowNode>(data.nodes)
      .enter()
      .append('circle')
      .attr('r', 36)
      .attr('class', 'node');

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
          .drag<SVGForeignObjectElement, IWorkflowNode>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x;
            d.fy = event.y;

            const node = {
              ...d,
              x: event.sourceEvent.screenX,
              y: event.sourceEvent.screenY,
            };
            onClickNode(node);

            setIsDragged(true);
          })
          .on('end', (event, d: any) => {
            if (isDragged) {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }
          })
      )
      .on('click', function (event: any, d: IWorkflowNode) {
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
