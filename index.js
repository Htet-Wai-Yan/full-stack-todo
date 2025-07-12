const apiUrl = 'http://localhost:8000/api.php';

const input = document.getElementById('task');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todo-list');

const form = document.getElementById('todo-form');

// Add todo
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const task = document.getElementById('task').value;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ task })
    });

    const data = await response.json(); // convert promise to JSON
    if (response.ok) {
        renderList(data);
        form.reset();
    } else {
        alert(data.error);
    }
});

async function getAll() {
    const response = await fetch(apiUrl);
    const todos = await response.json();

    console.log("list", todos)
    todos.forEach(renderList);
}

async function updateTodo(id, task = '', is_completed = 0) {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, task, is_completed })
    });

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
    }
}

async function deleteTodo(id) {
    const response = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    });

    if (!response.ok) {
        const data = await response.json();
        alert(data.error);
    }
}

function renderList(todo) {
    console.log("Todo item", todo);

    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    const span = document.createElement('span');

    li.className = 'flex items-center gap-2 p-2 border-b border-gray-200';

    // checkbox functionality
    checkbox.type = 'checkbox';
    checkbox.checked = todo.is_completed;
    li.appendChild(checkbox);

    span.textContent = todo.task;
    li.appendChild(span);
    span.className = todo.is_completed ? 'line-through' : '';

    checkbox.onchange = () => {
        todo.is_completed = checkbox.checked ? 1 : 0;
        updateTodo(todo.id, todo.task, todo.is_completed);
        span.className = todo.is_completed ? 'line-through' : '';
    };

    // Append flex box for buttons
    const flexBox = document.createElement('div');
    flexBox.className = 'flex items-center gap-2 ml-auto';
    li.appendChild(flexBox);

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    flexBox.appendChild(editBtn);

    editBtn.onclick = () => {
        console.log("id", todo.id)
        const newTask = prompt('Edit task:', todo.task);
        const id = todo.id;

        if (newTask !== null && newTask.trim() !== '') {
            span.textContent = newTask;
            updateTodo(id, newTask, todo.is_completed);
            todo.task = newTask; // update in html as well
        }
    };

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'text-red-500 hover:text-red-700';
    deleteBtn.textContent = 'Delete';
    flexBox.appendChild(deleteBtn);

    todoList.appendChild(li);

    // deleteBtn.onclick = () => confirm(`Are you sure you want to delete the task "${todo.task}"?`) && deleteTodo(todo.id);
    deleteBtn.onclick = () => {
        if (confirm(`Are you sure you want to delete the task "${todo.task}"?`)) {
            deleteTodo(todo.id);
            li.remove();
        }
    };
}

getAll();