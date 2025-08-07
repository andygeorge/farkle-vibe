#!/usr/bin/env node

// Very simple MCP server for Farkle scoring
// This is a minimal implementation to demonstrate MCP integration

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio');

// Simple farkle scoring function (reusing existing logic)
function calculateFarkleScore(dice) {
  // Validate dice
  if (!Array.isArray(dice) || dice.length !== 6) {
    return { score: 0, error: 'Must roll exactly 6 dice' };
  }
  
  const counts = {};
  for (let i = 1; i <= 6; i++) {
    counts[i] = 0;
  }
  
  dice.forEach(die => {
    if (die >= 1 && die <= 6) {
      counts[die]++;
    }
  });
  
  let score = 0;
  const combinations = [];
  
  // Check for three of a kind or more
  for (let value = 1; value <= 6; value++) {
    const count = counts[value];
    
    if (count >= 3) {
      const baseScore = value === 1 ? 1000 : value * 100;
      score += baseScore;
      combinations.push(`Three ${value}s`);
      
      // For four or more, add bonus
      if (count >= 4) {
        score += baseScore; 
        combinations.push(`Bonus for extra ${value}s`);
      }
    } else if (value === 1 || value === 5) {
      // Single ones and fives
      const singleScore = value === 1 ? 100 : 50;
      score += singleScore * count;
      if (count > 0) {
        combinations.push(`${count} single ${value}${count > 1 ? 's' : ''}`);
      }
    }
  }
  
  // Special case: straight
  const sortedDice = [...dice].sort((a, b) => a - b);
  if (JSON.stringify(sortedDice) === JSON.stringify([1, 2, 3, 4, 5, 6])) {
    score = 1500;
    combinations.push('Straight');
  }
  
  // Special case: three pairs
  const pairCount = Object.values(counts).filter(c => c === 2).length;
  if (pairCount === 3) {
    score = 1500;
    combinations.push('Three Pairs');
  }
  
  return {
    score,
    combinations: combinations.length > 0 ? combinations : ['Farkle'],
    isFarkle: score === 0
  };
}

// Create MCP server instance
const server = new McpServer({
  name: "farkle-scoring-server",
  version: "0.1.0"
});

// Add a tool for scoring farkle dice rolls
server.tool(
  "calculate_farkle_score",
  {
    dice: {
      type: "array",
      items: { type: "number", minimum: 1, maximum: 6 },
      minItems: 6,
      maxItems: 6,
      description: "Six dice values (1-6)"
    }
  },
  async ({ dice }) => {
    try {
      const result = calculateFarkleScore(dice);
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              score: result.score,
              combinations: result.combinations,
              isFarkle: result.isFarkle
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error calculating score: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }
);

// Add a resource for farkle scoring information
server.resource(
  "farkle_info",
  { uri: "farkle://info", list: false },
  async (uri) => {
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: "text/plain",
          text: "Farkle Scoring Information:\n- Score based on dice combinations\n- Three of a kind = 100 points per die (or 1000 for ones)\n- Single ones = 100 points each\n- Single fives = 50 points each\n- Straight = 1500 points\n- Three pairs = 1500 points"
        }
      ]
    };
  }
);

// Start the MCP server
const transport = new StdioServerTransport();
server.connect(transport).catch(console.error);
console.log('Farkle MCP Server started');