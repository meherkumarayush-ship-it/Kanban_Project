// // Establish connection to the Flask-SocketIO server [cite: 66]
// const socket = io();

// // Connection event
// socket.on('connect', () => {
//     console.log('Connected to real-time server');
// });

// socket.on('task_created', (data) => {
//     // 1. Find the correct column using the list_id [cite: 35-37, 47]
//     const targetList = document.querySelector(`.task-list[data-list-id="${data.list_id}"]`);
    
//     if (targetList) {
//         // 2. Create the HTML for the new task card [cite: 45-52]
//         const newTaskHtml = `
//             <div class="task-card" data-id="${data.id}">
//                 <h4>${data.title}</h4>
//                 <p>New task added</p>
//             </div>
//         `;
        
//         // 3. Add it to the column without a page refresh
//         targetList.insertAdjacentHTML('beforeend', newTaskHtml);
//     }
// });

// // Listen for the 'task_updated' event broadcasted by the server [cite: 64]
// socket.on('task_updated', (data) => {
//     console.log('Received update from server:', data);
    
//     // Find the task element in the DOM
//     const taskElement = document.querySelector(`.task-card[data-id="${data.task_id}"]`);
//     // Find the target column list
//     const targetList = document.querySelector(`.task-list[data-list-id="${data.new_list_id}"]`);

//     if (taskElement && targetList) {
//         // Move the task to the new column visually [cite: 61, 64]
//         targetList.appendChild(taskElement);
        
//         // Optional: Flash the card to show it was moved by someone else
//         taskElement.style.backgroundColor = '#fff9c4'; 
//         setTimeout(() => { taskElement.style.backgroundColor = 'white'; }, 1000);
//     }
// });

// // Error handling
// socket.on('connect_error', (err) => {
//     console.error('Socket connection error:', err);
// });