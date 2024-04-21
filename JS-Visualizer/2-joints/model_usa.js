function useModel(q1_current, q2_current, x, y) {
    return new Promise((resolve, reject) => {
      // Load the ONNX model
      const modelPath = 'IKModel.onnx'; // Replace with your model path
      const session = new onnx.InferenceSession();
  
      // Fetch the model (Assuming loading from a server)
      fetch(modelPath)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const modelData = new Uint8Array(buffer);
          return session.loadModel(modelData);
        })
        .then(() => {
          // Prepare input data
          const inputData = {
            'input': [x, y, q1_current, q2_current], // Use the provided input values
          };
  
          // Create input tensor
          const inputTensor = new onnx.Tensor(new Float32Array(inputData.input), 'float32', [1, 4]); // Adjust the shape according to your model
  
          // Run inference
          session.run([inputTensor]).then(outputMap => {
            let q1 = 0.0;
            let q2 = 0.0;
  
            // Get the output tensor by its key (adjust 'output' according to your model)
            for (let [key, value] of outputMap) {
              q1 = value.data[0];
              q2 = value.data[1];
            }
  
            const q = [q1, q2];
            resolve(q); // Resolve the Promise with the inferred values
          }).catch(error => {
            reject('Error during inference: ' + error); // Reject the Promise if there's an error
          });
  
        })
        .catch(error => {
          reject('Error loading the model: ' + error); // Reject the Promise if there's an error loading the model
        });
    });
  }
