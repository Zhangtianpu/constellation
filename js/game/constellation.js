import { normalizeEdge } from '../utils/math.js';

export class ConstellationChecker {
  constructor(constellationData) {
    this.edges = constellationData.edges;
    this.starCount = constellationData.stars.length;
    this.edgeSet = new Set(this.edges.map(e => normalizeEdge(e.from, e.to)));
  }

  check(userEdges) {
    const userSet = new Set(userEdges.map(e => normalizeEdge(e.from, e.to)));

    let correctCount = 0;
    for (const edge of userSet) {
      if (this.edgeSet.has(edge)) {
        correctCount++;
      }
    }

    if (correctCount === this.edgeSet.size && userSet.size === this.edgeSet.size) {
      return { correct: true, progress: 1 };
    }

    const wrongEdges = userSet.size - correctCount;
    return {
      correct: false,
      progress: correctCount / this.edgeSet.size,
      correctCount,
      wrongEdges,
    };
  }

  isEdgeValid(fromId, toId) {
    const key = normalizeEdge(fromId, toId);
    return this.edgeSet.has(key);
  }

  getExpectedEdges() {
    return this.edges;
  }

  getNextHint(connectedEdges, connectedStarIds) {
    if (connectedEdges.length === 0) {
      return { type: 'start', starId: this.edges[0].from };
    }

    const connectedSet = new Set(connectedEdges.map(e => normalizeEdge(e.from, e.to)));

    for (const edge of this.edges) {
      const key = normalizeEdge(edge.from, edge.to);
      if (!connectedSet.has(key)) {
        if (connectedStarIds.has(edge.from)) {
          return { type: 'connect', fromId: edge.from, toId: edge.to };
        }
        if (connectedStarIds.has(edge.to)) {
          return { type: 'connect', fromId: edge.to, toId: edge.from };
        }
      }
    }

    for (const edge of this.edges) {
      const key = normalizeEdge(edge.from, edge.to);
      if (!connectedSet.has(key)) {
        return { type: 'start', starId: edge.from };
      }
    }

    return null;
  }
}
