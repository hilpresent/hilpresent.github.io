window.addEventListener('load', () => {
    const form = document.querySelector("#new-task-form");
    const input = document.querySelector("#new-task-input");
    const list_el = document.querySelector("#tasks");

    // Load tasks from storage when the page is loaded
    loadTasks();

    // Event listener for the form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const task = input.value.trim();

        if (!task) {
            alert('Please add a task');
            return;
        }

        addTask(task);
        input.value = "";
        saveTasks();
    });

    // Function to create and append a new task
    function addTask(taskContent, isCompleted = false) {
        const task_el = document.createElement("div");
        task_el.classList.add('task');

        const task_content_el = document.createElement("div");
        task_content_el.classList.add('content');
        task_el.appendChild(task_content_el);

        const task_checkbox_el = document.createElement('input');
        task_checkbox_el.type = 'checkbox';
        task_checkbox_el.classList.add('checkbox');
        task_checkbox_el.checked = isCompleted;
        task_content_el.appendChild(task_checkbox_el);

        const task_input_el = document.createElement('input');
        task_input_el.classList.add('text');
        task_input_el.type = 'text';
        task_input_el.value = taskContent;
        task_input_el.setAttribute('readonly', 'readonly');
        task_content_el.appendChild(task_input_el);

        // Actions div will contain edit and delete buttons
        const task_actions_el = document.createElement('div');
        task_actions_el.classList.add('actions');

        // Create the "Edit" button but hide it if the task is completed
        const task_edit_el = document.createElement('button');
        task_edit_el.classList.add('edit');
        task_edit_el.innerText = 'Edit';
        task_actions_el.appendChild(task_edit_el);

        // "Edit" button event listener
        task_edit_el.addEventListener('click', () => {
            // Toggle between edit and save
            if (task_edit_el.innerText.toLowerCase() === 'edit') {
                task_input_el.removeAttribute('readonly');
                task_input_el.focus();
                task_edit_el.innerText = 'Save';
            } else {
                task_input_el.setAttribute('readonly', 'readonly');
                task_edit_el.innerText = 'Edit';
                saveTasks();
            }
        });

        // If the task is completed, hide the "Edit" button
        if (isCompleted) {
            task_edit_el.style.display = 'none';
        }

        // Always create the "Delete" button, it's visible for both completed and non-completed tasks
        const task_delete_el = document.createElement('button');
        task_delete_el.classList.add('delete');
        task_delete_el.innerText = 'Delete';
        task_actions_el.appendChild(task_delete_el);

        // "Delete" button event listener
        task_delete_el.addEventListener('click', () => {
            task_el.parentNode.removeChild(task_el);
            saveTasks();
        });

        task_el.appendChild(task_actions_el);

        // Append the task to the correct container based on completion status
        if (isCompleted) {
            task_input_el.classList.add('completed');
            document.querySelector('#completed-tasks').appendChild(task_el);
        } else {
            list_el.appendChild(task_el);
        }

        // Checkbox change handling
        task_checkbox_el.addEventListener('change', () => {
            if (task_checkbox_el.checked) {
                task_input_el.classList.add('completed');
                task_edit_el.style.display = 'none'; // Hide "Edit" button when task is completed
                document.querySelector('#completed-tasks').appendChild(task_el);
            } else {
                task_input_el.classList.remove('completed');
                task_edit_el.style.display = 'block'; // Show "Edit" button when task is uncompleted
                list_el.appendChild(task_el);
            }
            saveTasks();
        });
    }

    // Function to save all tasks to local storage
    function saveTasks() {
        const tasks = [];
        // Grab all tasks, regardless of completion status
        document.querySelectorAll('.task-list .task, .completed-task-list .task').forEach(taskElement => {
            const text = taskElement.querySelector('.content .text').value;
            const completed = taskElement.querySelector('.checkbox').checked;
            tasks.push({text: text, completed: completed});
        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Function to load tasks from local storage
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
            addTask(task.text, task.completed);
        });
    }
    
});
