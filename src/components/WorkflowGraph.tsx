import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import {
  IWorkflowGraphData,
  IWorkflowNode,
  IWorkflowTransition,
} from '../interface';

type WorkflowGraphProps = {
  data: IWorkflowGraphData;
  distance: number;
  onClickNode(node: IWorkflowNode | undefined): void;
};

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  data,
  distance,
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

    const width = svg.node()?.getBoundingClientRect().width ?? 0;
    const height = svg.node()?.getBoundingClientRect().height ?? 0;

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 5])
      .translateExtent([
        [0, 0],
        [width, height],
      ])
      .on('zoom', (event) => {
        svg.selectAll('g').attr('transform', event.transform);
      });

    svg.call(zoomBehavior);

    const simulation = d3
      .forceSimulation<IWorkflowNode>(data.nodes)
      .force(
        'link',
        d3
          .forceLink(data.transitions)
          .id((d: any) => d.id)
          .distance(distance)
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
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 30)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .attr('stroke', '#999');

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

            onClickNode(d);

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
      .on('click', function (event, d: IWorkflowNode) {
        onClickNode(d);

        const selectedNodeIds = data.transitions
          .filter((t: any) => t.source.id === d.id || t.target.id === d.id)
          .map((t: any) => (t.source.id === d.id ? t.target.id : t.source.id))
          .concat(d.id);

        svg.selectAll('.node').style('opacity', (n: any) => {
          return selectedNodeIds.includes(n.id) ? 1 : 0.1;
        });

        svg.selectAll('line').style('opacity', (t: any) => {
          return selectedNodeIds.includes(t.source.id) &&
            selectedNodeIds.includes(t.target.id)
            ? 1
            : 0.1;
        });
      });

    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        onClickNode(undefined);
        svg.selectAll('.node').style('opacity', 1);
        svg.selectAll('line').style('opacity', 1);
      }
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
  }, [data, distance]);

  return (
    <svg
      ref={svgRef}
      style={{
        backgroundColor: '#eeeeee',
        width: '100%',
        height: '100%',
      }}
    ></svg>
  );
};
