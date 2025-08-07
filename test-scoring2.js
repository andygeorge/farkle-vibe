// Test script for farkle scoring functionality from app.js

const { calculateFarkleScore } = require('./public/app.js');

console.log("Testing farkle scoring logic from app.js...");

// Test basic combinations
try {
    const result1 = calculateFarkleScore([1, 2, 3, 4, 5, 6]);
    console.log("Straight test:", result1);
    
    const result2 = calculateFarkleScore([1, 1, 1, 1, 1, 1]);
    console.log("Six of a kind test:", result2);
    
    const result3 = calculateFarkleScore([1, 1, 1, 5, 5, 5]);
    console.log("Three ones and three fives test:", result3);

    console.log("All tests completed successfully!");
} catch (error) {
    console.error("Error in scoring logic:", error);
}