"use client";
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import ReactFlow, {
    addEdge,
    Background,
    BackgroundVariant,
    Connection,
    Controls,
    Edge, getOutgoers,
    MiniMap, Node, ReactFlowProvider, updateEdge,
    useEdgesState,
    useNodesState
} from 'reactflow';
import {v4} from "uuid"

import 'reactflow/dist/style.css';
import Input from "@/app/circuit/components/nodes/input";
import Output from "@/app/circuit/components/nodes/output";
import Gate from "@/app/circuit/components/nodes/gate";

const indexToLabel = (index: number): string => {
    let result = '';
    let current = index;

    while (current >= 0) {
        result = String.fromCharCode(65 + (current % 26)) + result;
        current = Math.floor(current / 26) - 1;
    }

    return result;
};

interface GateType {
    id: string;
    color:string;
    name: string;
    inputs?: string[];
    outputs: { [key: string]: string };
    circuit?: { gates: GateType[], wires: Wire[] };
}

interface Wire {
    source: string;
    target: string;
}

const GateList: GateType[] = [{
    id: '1',
    name: 'AND',
    color:'#267AB2',
    inputs: ['a', 'b'],
    outputs: {out: 'a && b'},
}, {
    id: '2',
    name: 'OR',
    color:'#0D6E52',
    inputs: ['x', 'y'],
    outputs: {out: 'x || y'},
}, {
    id: '3',
    name: 'NOT',
    color:'#8C1F1A',
    inputs: ['a'],
    outputs: {out: '!a'},
}, {
    id: '4',
    name: 'NAND',
    color:'#5C2D91',
    inputs: ['a', 'b'],
    outputs: {out: '!(a && b)'},
}, {
    id: '5',
    name: 'NOR',
    color:'#1F5B70',
    inputs: ['a', 'b'],
    outputs: {out: '!(a || b)'},
}, {
    id: '6',
    name: 'XOR',
    color:'#A65B1F',
    inputs: ['a', 'b'],
    outputs: {out: '(a && !b) || (!a && b)'},
}, {
    id: '7',
    name: 'XNOR',
    color:'#3F6B2F',
    inputs: ['a', 'b'],
    outputs: {out: '!((a && !b) || (!a && b))'},
}];


const proOptions = {hideAttribution: true};


function CircuitMaker() {
    const reactFlowWrapper = useRef(null);

    const edgeUpdateSuccessful = useRef(true);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [inputValues, setInputValues] = useState<{ [key: string]: boolean }>({});
    const [outputValues, setOutputValues] = useState<{ [key: string]: boolean }>({});
    const [paletteOpen, setPaletteOpen] = useState(true);
    const [pendingNode, setPendingNode] = useState<{ type: string; gate?: GateType } | null>(null);
    const [nextLabelIndex, setNextLabelIndex] = useState(0);

    const nodeTypes = useMemo(() => {
        return {
            ip: Input,
            op: Output,
            gate: Gate
        }
    }, []);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onEdgeUpdateStart = useCallback(() => {
        edgeUpdateSuccessful.current = false;
    }, []);

    const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
        edgeUpdateSuccessful.current = true;
        setEdges((els) => updateEdge(oldEdge, newConnection, els));
    }, [setEdges]);

    const onEdgeUpdateEnd = useCallback((_: any, edge: Edge) => {
        if (!edgeUpdateSuccessful.current) {
            setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        }

        edgeUpdateSuccessful.current = true;
    }, [setEdges]);

    const handlePaletteSelect = useCallback((type: string, gate?: GateType) => {
        setPendingNode({type, gate});
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setPaletteOpen(false);
        }
    }, [setPaletteOpen]);

    const handlePaneClick = useCallback((event: any) => {
        if (!pendingNode) {
            return;
        }

        const type = pendingNode.type;

        const position = reactFlowInstance?.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        if (!position) {
            return;
        }

        let nodeData: any;
        if (type === 'gate') {
            if (!pendingNode.gate) {
                return;
            }
            nodeData = pendingNode.gate;
        } else {
            const generatedLabel = indexToLabel(nextLabelIndex);
            setNextLabelIndex((prev) => prev + 1);
            nodeData = {label: generatedLabel};
        }

        const newNode = {
            id: v4(),
            type,
            position,
            data: nodeData,
        };

        setNodes((nds) => nds.concat(newNode));
        setPendingNode(null);
    }, [pendingNode, nextLabelIndex, reactFlowInstance, setNodes]);

    useEffect(() => {

        // function buildCircuit(){
        //     const inputs = nodes.filter(node => node.type === 'ip');
        //     const outputs = nodes.filter(node => node.type === 'op');
        //     const gates = nodes.filter(node => node.type === 'gate');
        //     const wires = edges;
        //
        //     const visited = new Set<string>();
        //
        //     function simplifyNode(node: Node){
        //         if(node.type === 'ip'){
        //             return node.data.label;
        //         // }else if(node.type === 'op'){
        //         //     return node.data.value;
        //         }else if(node.type === 'gate'){
        //             if (!visited.has(node.id)) {
        //                 visited.add(node.id);
        //                 if (node.data.logic){
        //                     getIncomers(node, nodes, edges).map(node => simplifyNode(node));
        //                 }
        //             }
        //
        //         }
        //     }
        //
        // }

        function simulateCircuit(nodes: Node[], edges: Edge[], inputValues: { [key: string]: boolean }) {

            const inputs = nodes.filter(node => node.type === 'ip');
            const nodeStates = new Map<string, boolean>();
            let queue: Node[] = [];

            inputs.forEach(input => {
                nodeStates.set(input.id + '-o', inputValues[input.id] ?? false);
                queue = [...queue, ...getOutgoers(input, nodes, edges)];
            })


            function calculateNode(node: Node) {
                if (node.type === 'gate') {
                    const gate_inputs = edges.filter(edge => edge.target === node.id).map((edge) => {
                        const sourceValue = nodeStates.get(edge.sourceHandle!) ?? false;
                        nodeStates.set(edge.targetHandle!, sourceValue);
                        return `${edge.targetHandle!.split('-').pop()}=${sourceValue}`;
                    }).join(',');

                    if (!Object.values(node.data.outputs).includes(null)) {
                        Object.keys(node.data.outputs).forEach(output => {
                            let result: boolean;
                            const current = nodeStates.get(node.id + '-o-' + output);
                            console.log(`const ${gate_inputs}; return ${node.data.outputs[output]}`);
                            result = new Function(`let ${node.data.inputs.map((i: string) => i + '=false').join(',')};${gate_inputs}; return ${node.data.outputs[output]}`)();

                            if (current !== result) {
                                nodeStates.set(node.id + '-o-' + output, result);
                                getOutgoers(node, nodes, edges).forEach(node => queue.push(node));
                            }
                        })
                    } else {

                    }
                }

                if (node.type === 'op') {
                    console.log(node.id);
                    const source = edges.find(edge => edge.target === node.id);
                    if (source) {
                        const sourceValue = nodeStates.get(source.sourceHandle!) ?? false;
                        nodeStates.set(node.id + '-i', sourceValue);
                    }
                }
            }

            while (queue.length > 0) {
                const node = queue.shift()!;
                calculateNode(node);
            }

            return Object.fromEntries(nodeStates.entries())
        }

        setOutputValues(simulateCircuit(nodes, edges, inputValues));

    }, [edges, inputValues, nodes]);


    return (
        <ReactFlowProvider>
            <div className="h-screen w-screen" ref={reactFlowWrapper}>
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={nodes.map(node => {
                        if (node.type === 'ip') {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    value: outputValues[node.id + '-o'] ?? false,
                                    toggle: () => {
                                        setInputValues(prevState => {
                                            return {...prevState, [node.id]: !prevState[node.id]}
                                        })
                                    },
                                    remove: () => setNodes((prev) => prev.filter((n) => n.id !== node.id))
                                },
                            }
                        }
                        if (node.type === 'op') {
                            return {
                                ...node,
                                data: {
                                    ...node.data,
                                    value: outputValues[node.id + '-i'] ?? false,
                                    remove: () => setNodes((prev) => prev.filter((n) => n.id !== node.id))
                                },
                            }
                        }
                        return {
                            ...node,
                            data: {
                                ...node.data, outputs: Object.fromEntries(Object.keys(node.data.outputs).map(i => {
                                    return [i, {...node.data.outputs[i], value: outputValues[node.id + '-o-' + i]}]
                                })), inputvalues: Object.fromEntries(node.data.inputs.map((i: string) => {
                                    return [i, {...node.data.inputs[i], value: outputValues[node.id + '-i-' + i]}]
                                })),
                                remove: () => setNodes((prev) => prev.filter((n) => n.id !== node.id))
                            }
                        }
                    })}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgeUpdate={onEdgeUpdate}
                    onEdgeUpdateStart={onEdgeUpdateStart}
                    onEdgeUpdateEnd={onEdgeUpdateEnd}
                    proOptions={proOptions}
                    onInit={setReactFlowInstance}
                    onPaneClick={handlePaneClick}
                >
                    <Background variant={BackgroundVariant.Dots} className="bg-[#353536]" gap={12} size={1}/>
                    <Controls/>
                    <MiniMap/>
                </ReactFlow>
            </div>
            <div className="absolute top-6 left-6 z-50 flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setPaletteOpen((prev) => !prev)}
                    aria-expanded={paletteOpen}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white/85 backdrop-blur transition hover:scale-[1.02] hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                    <span className="text-xs">Toolbar</span>
                    <span className="text-lg leading-none">≡</span>
                </button>
            </div>
            <div
                className={`absolute top-20 left-6 z-40 flex w-72 max-w-[85vw] -translate-y-2 flex-col gap-2 rounded-2xl border border-white/10 bg-[#141414]/95 p-4 text-white shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur transition-all duration-200 ease-out ${paletteOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
            >
                <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                    Next label • {indexToLabel(nextLabelIndex)}
                </div>
                <button
                    type="button"
                    onClick={() => handlePaletteSelect('ip')}
                    className={`w-full rounded border border-[#303030] bg-[#303030] p-2 text-center text-2xl transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${pendingNode?.type === 'ip' ? 'ring-2 ring-amber-300' : ''}`}
                >
                    Input
                </button>
                <button
                    type="button"
                    onClick={() => handlePaletteSelect('op')}
                    className={`w-full rounded border border-[#303030] bg-[#303030] p-2 text-center text-2xl transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${pendingNode?.type === 'op' ? 'ring-2 ring-amber-300' : ''}`}
                >
                    Output
                </button>
                <hr />
                <span className={"mt"}></span>
                {GateList.map(gate => (
                    <button
                        key={gate.id}
                        type="button"
                        onClick={() => handlePaletteSelect('gate', gate)}
                        className={`w-full rounded border border-[#303030] bg-[#303030] p-2 text-center text-2xl transition hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${pendingNode?.type === 'gate' && pendingNode?.gate?.id === gate.id ? 'ring-2 ring-amber-300' : ''}`}
                    >
                        {gate.name}
                    </button>
                ))}
            </div>
        </ReactFlowProvider>
    );
}

export default CircuitMaker;