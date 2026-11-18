
// Block 3-V：往後若要用 vibe coding 增加互動功能，可從這個檔案修改。
(() => {
  const data = JSON.parse(document.getElementById('network-data').textContent);
  const metricSelect = document.getElementById('metric-select');
  const metricTitle = document.getElementById('metric-title');
  const infoBox = document.getElementById('selected-info');
  const names = { degree: 'Degree Centrality', betweenness: 'Betweenness Centrality', eigenvector: 'Eigenvector Centrality' };
  const resetButton = document.getElementById('reset-view');
  const originalNodes = data.nodes;
  const rawValues = (metric) => originalNodes.map(node => Number(node[metric]) || 0);

  // 依目前指標的最小值與最大值，將節點大小縮放到 14～48。
  function nodeSize(node, metric) {
    const values = rawValues(metric);
    const low = Math.min(...values);
    const high = Math.max(...values);
    const normalized = high === low ? 0.5 : (node[metric] - low) / (high - low);
    return 14 + normalized * 34;
  }

  const nodes = new vis.DataSet(originalNodes.map(node => ({
    ...node, size: nodeSize(node, 'degree'),
    title: `${node.label}\nDegree: ${node.degree.toFixed(3)}\nBetweenness: ${node.betweenness.toFixed(3)}\nEigenvector: ${node.eigenvector.toFixed(3)}`
  })));
  const edges = new vis.DataSet(data.edges);
  const network = new vis.Network(document.getElementById('network'), { nodes, edges }, {
    autoResize: true,
    physics: false,
    interaction: { dragNodes:true, dragView:true, zoomView:true, hover:true },
    // 黑底配色：節點加亮、文字白色、連線改深灰
    nodes: { shape:'dot', borderWidth:1.5, color:{ background:'#4d91c5', border:'#9cc9ec', highlight:{background:'#dd9858',border:'#f3c28f'}, hover:{background:'#6aa9d8',border:'#cfe6f8'} }, font:{ size:15, color:'#e6edf3', strokeWidth:3, strokeColor:'#000' } },
    edges: { color:{color:'#55657a',highlight:'#f3c28f',hover:'#8aa4c0'}, width:1.4, smooth:false }
  });

  function displaySelection(nodeId) {
    const node = originalNodes.find(n => n.id === nodeId);
    if (!node) { infoBox.textContent = '點選節點可以查看其分數。'; return; }
    infoBox.textContent = `${node.label}｜${names[metricSelect.value]}：${Number(node[metricSelect.value]).toFixed(3)}`;
  }

  // 只修改節點大小，不重新建立 network，維持節點座標。
  metricSelect.addEventListener('change', () => {
    const metric = metricSelect.value;
    metricTitle.textContent = names[metric];
    nodes.update(originalNodes.map(node => ({ id:node.id, size:nodeSize(node, metric) })));
    const selected = network.getSelectedNodes();
    if (selected.length) displaySelection(selected[0]);
  });
  // 【1118 新增】點擊節點：只保留該節點與鄰近節點；點空白處恢復全部
  function focusNode(nodeId) {
    const keep = new Set([nodeId, ...network.getConnectedNodes(nodeId).map(String)]);
    nodes.update(originalNodes.map(node => ({ id:node.id, hidden:!keep.has(node.id) })));
    edges.update(edges.get().map(e => ({ id:e.id, hidden:!(keep.has(e.from) && keep.has(e.to)) })));
    network.selectNodes([nodeId]);
    displaySelection(nodeId);
  }
  function showAll() {
    nodes.update(originalNodes.map(node => ({ id:node.id, hidden:false })));
    edges.update(edges.get().map(e => ({ id:e.id, hidden:false })));
    network.unselectAll();
    displaySelection(null);
  }
  network.on('click', params => {
    if (params.nodes.length) focusNode(String(params.nodes[0]));
    else if (!params.edges.length) showAll();
  });
  resetButton.addEventListener('click', showAll);
})();
