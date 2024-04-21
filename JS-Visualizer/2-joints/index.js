q1 = 2
q2 = 2

previous_x = 0.0
previous_y = 0.0

function drawLine(x1, y1, x2, y2, lineElement) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  lineElement.style.width = length + 'px';
  lineElement.style.transform = `rotate(${angle}rad)`;
  lineElement.style.top = y1 + 'px';
  lineElement.style.left = x1 + 'px';

  // Adjust line positioning to start from center of circle
  lineElement.style.transformOrigin = '0 0'; // Set the rotation origin to the start of the line
}



function useModel(x, y, q1_current, q2_current) {
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
          console.log("input: ", inputTensor)

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


  function find_pos(q1, q2){
    
    let l1 = 5;
    let l2 = 5;

    let x1 = 0.0
    let y1 = 0.0
    let x2 = 0.0
    let y2 = 0.0
    
    x1 = Math.cos(q1)*l1;
    y1 = Math.sin(q1)*l1;

    x2 = l2*Math.cos(q1)*Math.cos(q2) - l2*Math.sin(q1)*Math.sin(q2) + x1;
    y2 = l2*Math.sin(q1)*Math.cos(q2) + l2*Math.cos(q1)*Math.sin(q2) + y1;
    return [x1,y1,x2,y2]
    
  }

  function denormalize(x,y, maxX, maxY, radius){
    newX = (x*radius/maxX) + radius;

    newY= (y*radius/maxY) + radius;



    return [newX,newY]

  }
  

  
  document.addEventListener("DOMContentLoaded", function() {
    const visualizer = document.getElementById("visualizer");
    const centerCircle = document.querySelector(".center-circle");
  
    let first_click = true;
    let circle_1 = createCircle();
    let circle_2 = createCircle();
    let targetCircle = createTargetCircle();
    const line1 = document.querySelector(".line-1");
    const line2 = document.querySelector(".line-2");
  
    function createCircle() {
      const circle = document.createElement("div");
      circle.classList.add("circle");
      visualizer.appendChild(circle);
      return circle;
    }
  
    function createTargetCircle() {
      const target = document.createElement("div");
      target.classList.add("target-circle");
      visualizer.appendChild(target);
      return target;
    }

    
  function modifyTargetPosition(x, y) {
    targetCircle.style.left = x + "px";
    targetCircle.style.top = y + "px";
  }

  function fadeInTarget() {
    targetCircle.style.opacity = 1;
  }

  function fadeOutTarget() {
    targetCircle.style.opacity = 0;
  }


    function modifyCircle1Position(x, y) {
      circle_1.style.left = x-5 + "px";
      circle_1.style.top = y-5 + "px";
    }
  
    function modifyCircle2Position(x, y) {
      circle_2.style.left = x-5 + "px";
      circle_2.style.top = y-5 + "px";
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    
  
    visualizer.addEventListener("click", async function(event) {
      
      started = false;

      modifyTargetPosition(event.clientX - visualizer.getBoundingClientRect().left,event.clientY - visualizer.getBoundingClientRect().top)
      
      fadeInTarget();


      var radius = (visualizer.getBoundingClientRect().right-visualizer.getBoundingClientRect().left)/2;
      var clickX = event.clientX - (visualizer.getBoundingClientRect().left+visualizer.getBoundingClientRect().right)/2;
      var clickY = (visualizer.getBoundingClientRect().top+visualizer.getBoundingClientRect().bottom)/2 - event.clientY;

      x = clickX/radius * 10
      y = clickY/radius * 10
      let result = null;
      let modelCompleted = false;

      var i = 0;

      started = true;

      while(1){

        if(!started){
          break;
        }

        i = i + 1

        console.log(i)

        if(i>500){
          break;
        }

        delta_x = (x-previous_x)
        delta_y = (y-previous_y)

        sum = (delta_x**2 + delta_y**2)**0.5

        delta_x = delta_x/sum
        delta_y = delta_y/sum

        factor = 0.5   * (i/100)

        delta_x = delta_x * factor
        delta_y = delta_y * factor


        next_x = delta_x + previous_x
        next_y = delta_y + previous_y

        // dp = denormalize(next_x,-next_y,10,10,visualizer.offsetWidth/2)

        // modifyTargetPosition(dp[0],dp[1])


        if((((x-previous_x)*(x-previous_x) + (y-previous_y)*(y-previous_y))**0.5) < 0.2){
          console.log("done")
          fadeOutTarget();
          break;
        }

        useModel(next_x, next_y,q1, q2)
        .then((res) => {
          console.log(res)
          result = res; // Store the result
          modelCompleted = true; // Mark the model completion flag
        })
        .catch((error) => {
          console.error("Error during model inference:", error);
          modelCompleted = true; // Even if there's an error, mark completion to avoid an infinite loop
        });
    
      // Wait for the model to complete before proceeding
      while (!modelCompleted) {
        await sleep(4)
        // This loop will block the execution until the model completes
        // You might want to add a timeout or escape condition to avoid infinite waiting
      }

        positions = find_pos(result[0],result[1]);
        previous_x = positions[2]
        previous_y = positions[3]

    
        circle_1_pos = denormalize(positions[0],-positions[1],10,10,visualizer.offsetWidth/2)
        circle_2_pos = denormalize(positions[2],-positions[3],10,10,visualizer.offsetWidth/2)


        modifyCircle1Position(circle_1_pos[0], circle_1_pos[1]);
        modifyCircle2Position(circle_2_pos[0],circle_2_pos[1])

        drawLine(visualizer.offsetWidth/2, visualizer.offsetHeight/2, circle_1_pos[0],circle_1_pos[1], line1)
        drawLine(circle_1_pos[0], circle_1_pos[1], circle_2_pos[0],circle_2_pos[1], line2)
        
      

        q1 = result[0];
        q2 = result[1];

        await sleep(4)
        

      }


      






      
      // visualizer.removeChild(circle_1);
      // circle_1 = createCircle();
      // modifyCircle1Position(clickX - 5, clickY - 5);

    });
  
    positions = find_pos(q1,q2);

    previous_x = positions[2]
    previous_y = positions[3]


    circle_1_pos = denormalize(positions[0],-positions[1],10,10,visualizer.offsetWidth/2)
    circle_2_pos = denormalize(positions[2],-positions[3],10,10,visualizer.offsetWidth/2)
    previous_x = positions[2]
    previous_y = positions[3]


    modifyCircle1Position(circle_1_pos[0], circle_1_pos[1]);
    modifyCircle2Position(circle_2_pos[0],circle_2_pos[1])

    drawLine(visualizer.offsetWidth/2, visualizer.offsetHeight/2, circle_1_pos[0],circle_1_pos[1], line1)
    drawLine(circle_1_pos[0], circle_1_pos[1], circle_2_pos[0],circle_2_pos[1], line2)
  
    
  });
  