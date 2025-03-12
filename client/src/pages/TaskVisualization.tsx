import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api.ts';
import * as d3 from 'd3';

interface Task {
  _id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  dependencies: Task[];
}

interface Node {
  id: string;
  title: string;
  status: string;
}

interface Link {
  source: string;
  target: string;
}

const TaskVisualization: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/api/tasks');
        setTasks(response.data.data.tasks);
        setError(null);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    if (!isLoading && tasks.length > 0 && svgRef.current) {
      renderGraph();
    }
  }, [isLoading, tasks]);

  const renderGraph = () => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove();

    // Prepare data for D3
    const nodes: Node[] = tasks.map(task => ({
      id: task._id,
      title: task.title,
      status: task.status
    }));

    const links: Link[] = [];
    tasks.forEach(task => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(dep => {
          links.push({
            source: dep._id,
            target: task._id
          });
        });
      }
    });

    // Set up SVG dimensions
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = Math.max(600, containerRef.current.clientHeight);
    
    const svg = d3.select(svgRef.current)
      .attr('width', containerWidth)
      .attr('height', containerHeight);

    // Create a group for the graph
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Reset zoom to fit the graph
    svg.call((zoom as any).transform, d3.zoomIdentity);

    // Create a force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(containerWidth / 2, containerHeight / 2))
      .force('collision', d3.forceCollide().radius(80));

    // Create links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    // Define arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke', 'none');

    // Create node groups
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('.node')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    // Add circles to nodes
    node.append('circle')
      .attr('r', 30)
      .attr('fill', (d: Node) => {
        switch (d.status) {
          case 'completed': return '#10B981'; // green
          case 'in-progress': return '#3B82F6'; // blue
          case 'overdue': return '#EF4444'; // red
          default: return '#6B7280'; // gray
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add text to nodes
    node.append('text')
      .text((d: Node) => d.title.length > 20 ? d.title.substring(0, 17) + '...' : d.title)
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('fill', '#fff')
      .style('font-size', '12px')
      .style('pointer-events', 'none');

    // Add title for tooltip
    node.append('title')
      .text((d: Node) => `${d.title} (${d.status})`);

    // Make nodes clickable
    node.on('click', (event: any, d: Node) => {
      window.location.href = `/tasks/edit/${d.id}`;
    })
    .style('cursor', 'pointer');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Task Dependency Visualization</h1>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors duration-200"
          >
            Back to Dashboard
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-md">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 p-4 rounded-md">
            No tasks found. Create some tasks with dependencies to visualize them.
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4" ref={containerRef} style={{ height: '70vh' }}>
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                Completed
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mx-2 ml-4"></span>
                In Progress
                <span className="inline-block w-3 h-3 rounded-full bg-red-500 mx-2 ml-4"></span>
                Overdue
                <span className="inline-block w-3 h-3 rounded-full bg-gray-500 mx-2 ml-4"></span>
                Pending
              </p>
              <p className="mt-2">
                <strong>Tip:</strong> Drag nodes to rearrange. Click on a node to edit the task. Scroll to zoom in/out.
              </p>
            </div>
            <svg ref={svgRef} className="w-full h-full"></svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskVisualization; 