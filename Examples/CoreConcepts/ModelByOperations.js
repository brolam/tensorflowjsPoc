const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');
// Define constants: y = 2x^2 + 4x + 8
const a = tf.scalar(2);
const b = tf.scalar(4);
const c = tf.scalar(8);

// Define function
function predict(input) {
    // y = a * x ^ 2 + b * x + c
    // More on tf.tidy in the next section
    return tf.tidy(() => {
      const x = tf.scalar(input);
  
      const ax2 = a.mul(x.square());
      const bx = b.mul(x);
      const y = ax2.add(bx).add(c);
  
      return y;
    });
  }
  // Predict output for input of 2
  const result = predict(2);
  result.print() // Output: 24