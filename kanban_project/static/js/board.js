// Initialize Socket.IO connection
const socket = io();

document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.task-list');

    // 1. Initialize Drag & Drop for each column [cite: 68-70, 72-73]
    columns.forEach(column => {
        new Sortable(column, {
            group: 'kanban-group', // Allows moving tasks between lists [cite: 12, 58]
            animation: 150,
            ghostClass: 'blue-background-class',
            
            // Triggered when a task is dropped [cite: 60-61]
            onEnd: function (evt) {
                const taskId = evt.item.getAttribute('data-id');
                const newListId = evt.to.getAttribute('data-list-id');
                const newPosition = evt.newIndex;

                // 2. Send the update to the server via Socket.IO [cite: 64, 66]
                socket.emit('move_task', {
                    task_id: taskId,
                    new_list_id: newListId,
                    position: newPosition
                });
            }
        });
    });
});

// 3. Listen for Real-Time updates from other users 
socket.on('task_updated', (data) => {
    const taskElement = document.querySelector(`[data-id="${data.task_id}"]`);
    const targetList = document.querySelector(`[data-list-id="${data.new_list_id}"]`);

    if (taskElement && targetList) {
        // Move the task element in the DOM for other users instantly 
        targetList.appendChild(taskElement);
        console.log(`Task ${data.task_id} moved to list ${data.new_list_id} by another user.`);
    }
});

// 4. Helper Function: Create a Task (Requirement 4) [cite: 44, 54]
async function createTask(listId, title) {
    const token = localStorage.getItem('access_token'); 
    
    // Check if user is logged in first
    if (!token) {
        alert("Please login first!");
        window.location.href = '/login';
        return;
    }

    try {
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ list_id: listId, title: title })
        });

        if (response.ok) {
            // Force a reload to fetch new data from the DB
            window.location.reload(); 
        } else {
            const err = await response.json();
            alert("Error: " + err.msg);
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}