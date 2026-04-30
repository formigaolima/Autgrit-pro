import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  label: string;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  value: number;
}

const data: { nodes: Node[]; links: Link[] } = {
  nodes: [
    { id: 'central', group: 1, label: 'CORE_GATEWAY' },
    { id: 'node1', group: 2, label: 'URBAN_RIDE_01' },
    { id: 'node2', group: 2, label: 'E_COMM_HUB_A' },
    { id: 'node3', group: 3, label: 'SEC_ENCLAVE' },
    { id: 'node4', group: 3, label: 'AUTH_MATRIX' },
    { id: 'node5', group: 4, label: 'LIQ_POOL_ALPHA' },
    { id: 'node6', group: 4, label: 'CROSS_CHAIN_RLY' },
  ],
  links: [
    { source: 'central', target: 'node1', value: 1 },
    { source: 'central', target: 'node2', value: 1 },
    { source: 'central', target: 'node3', value: 2 },
    { source: 'node3', target: 'node4', value: 1 },
    { source: 'node2', target: 'node5', value: 1 },
    { source: 'node5', target: 'node6', value: 2 },
  ]
};

export const TopologyMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 400;

    // Clear previous SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;')
      .attr('class', 'bg-slate-50/50');

    const simulation = d3.forceSimulation<Node>(data.nodes)
      .force('link', d3.forceLink<Node, Link>(data.links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-opacity', 0.8)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value) * 2);

    const node = svg.append('g')
      .attr('stroke', '#7C3AED')
      .attr('stroke-width', 1)
      .selectAll<SVGGElement, Node>('g')
      .data(data.nodes)
      .join('g')
      .call(drag(simulation));

    node.append('rect')
      .attr('width', 80)
      .attr('height', 30)
      .attr('x', -40)
      .attr('y', -15)
      .attr('rx', 4)
      .attr('fill', d => d.group === 1 ? '#7C3AED' : '#FFFFFF')
      .attr('stroke', d => d.group === 1 ? '#7C3AED' : '#E2E8F0')
      .attr('stroke-width', 2);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', d => d.group === 1 ? '#FFFFFF' : '#0F172A')
      .attr('font-size', '8px')
      .attr('font-weight', '700')
      .attr('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace')
      .text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: d3.Simulation<Node, undefined>) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }
  }, []);

  return (
    <div className="w-full h-[400px] bg-white border border-slate-100 relative overflow-hidden rounded-lg shadow-sm">
      <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-300 uppercase tracking-widest z-10 font-bold">
        Interactive_Node_Resolver v1.2
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-primary/70 uppercase tracking-widest z-10 animate-pulse font-bold">
        System_Alive
      </div>
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />
    </div>
  );
};
