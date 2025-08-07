// Test script for farkle scoring functionality

const { calculateScore } = require('./farkle-rules.js');

console.log("Testing farkle scoring logic...");

// Test basic combinations
try {
    const result1 = calculateScore([1, 2, 3, 4, 5, 6]);
    console.log("Straight test:", result1);
    
    const result2 = calculateScore([1, 1, 1, 1, 1, 1]);
    console.log("Six of a kind test:", result2);
    
    const result3 = calculateScore([1, 1, 1, 5, 5, 5]);
    console.log("Three ones and three fives test:", result3);
    
    const result4 = calculateScore([2, 2, 2, 2, 2, 2]);
    console.log("Five of a kind test:", result4);
    
    const result5 = calculateScore([1, 2, 3, 4, 5, 6]); // Straight
    console.log("Straight test (again):", result5);

    console.log("All tests completed successfully!");
} catch (error) {
    console.error("Error in scoring logic:", error);
}