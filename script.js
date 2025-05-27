// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const taskPriority = document.getElementById('taskPriority');
    const taskDueDate = document.getElementById('taskDueDate');
    const taskCategory = document.getElementById('taskCategory');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const editModal = document.getElementById('editModal');
    const closeModal = document.querySelector('.close-modal');
    const editTaskInput = document.getElementById('editTaskInput');
    const editTaskPriority = document.getElementById('editTaskPriority');
    const editTaskDueDate = document.getElementById('editTaskDueDate');
    const editTaskCategory = document.getElementById('editTaskCategory');
    const saveTaskBtn = document.getElementById('saveTaskBtn');

    // Set today as the default due date
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    taskDueDate.value = formattedDate;

    // Initialize tasks array from localStorage or empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentEditTaskId = null;

    // Initialize the app
    init();

    // Add event listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    clearCompletedBtn.addEventListener('click', clearCompleted);
    closeModal.addEventListener('click', () => {
        editModal.classList.remove('show');
    });
    saveTaskBtn.addEventListener('click', saveEditedTask);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('show');
        }
    });

    // Add event listeners to filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Set current filter
            currentFilter = btn.getAttribute('data-filter');
            // Render tasks with the new filter
            renderTasks();
        });
    });

    // Initialize the app
    function init() {
        renderTasks();
        updateTaskCount();
    }

    // Function to add a new task
    function addTask() {
        // Get the task text from the input
        const taskText = taskInput.value.trim();

        // Check if the input is not empty
        if (taskText !== '') {
            // Create a new task object
            const newTask = {
                id: Date.now().toString(),
                text: taskText,
                completed: false,
                priority: taskPriority.value,
                dueDate: taskDueDate.value,
                category: taskCategory.value,
                createdAt: new Date().toISOString()
            };

            // Add the task to the tasks array
            tasks.push(newTask);

            // Save to localStorage
            saveTasks();

            // Render tasks
            renderTasks();

            // Update task count
            updateTaskCount();

            // Clear the input field
            taskInput.value = '';
            
            // Reset to default values
            taskPriority.value = 'medium';
            taskDueDate.value = formattedDate;
            taskCategory.value = 'personal';
            
            // Focus back on the input field
            taskInput.focus();
        }
    }

    // Function to render tasks based on the current filter
    function renderTasks() {
        // Clear the task list
        taskList.innerHTML = '';

        // Filter tasks based on the current filter
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'all') return true;
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true;
        });

        // Render each task
        filteredTasks.forEach(task => {
            const li = createTaskElement(task);
            taskList.appendChild(li);
        });

        // Update task count
        updateTaskCount();
    }

    // Function to create a task element
    function createTaskElement(task) {
        // Create a new list item
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            toggleTaskCompletion(task.id);
            if (checkbox.checked) {
                li.classList.add('task-complete-animation');
                setTimeout(() => {
                    li.classList.remove('task-complete-animation');
                }, 300);
            }
        });

        // Create task content container
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content';

        // Create a span for the task text
        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        if (task.completed) taskSpan.classList.add('completed');
        taskSpan.textContent = task.text;

        // Create task details container
        const taskDetails = document.createElement('div');
        taskDetails.className = 'task-details';

        // Add priority badge
        const priorityBadge = document.createElement('span');
        priorityBadge.className = `task-detail priority-${task.priority}`;
        priorityBadge.innerHTML = `<i class="fas fa-flag"></i> ${capitalizeFirstLetter(task.priority)}`;
        taskDetails.appendChild(priorityBadge);

        // Add category badge
        const categoryBadge = document.createElement('span');
        categoryBadge.className = `task-detail category-${task.category}`;
        categoryBadge.innerHTML = `<i class="fas fa-tag"></i> ${capitalizeFirstLetter(task.category)}`;
        taskDetails.appendChild(categoryBadge);

        // Add due date badge
        if (task.dueDate) {
            const dueDateBadge = document.createElement('span');
            const dueClass = getDueDateClass(task.dueDate);
            dueDateBadge.className = `task-detail ${dueClass}`;
            dueDateBadge.innerHTML = `<i class="fas fa-calendar"></i> ${formatDate(task.dueDate)}`;
            taskDetails.appendChild(dueDateBadge);
        }

        // Append text and details to content
        taskContent.appendChild(taskSpan);
        taskContent.appendChild(taskDetails);

        // Create actions container
        const taskActions = document.createElement('div');
        taskActions.className = 'task-actions';

        // Create edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => {
            openEditModal(task);
        });

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            li.classList.add('delete-animation');
            setTimeout(() => {
                deleteTask(task.id);
            }, 300);
        });

        // Append buttons to actions
        taskActions.appendChild(editBtn);
        taskActions.appendChild(deleteBtn);

        // Append elements to the list item
        li.appendChild(checkbox);
        li.appendChild(taskContent);
        li.appendChild(taskActions);

        return li;
    }

    // Function to toggle task completion
    function toggleTaskCompletion(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });

        saveTasks();
        renderTasks();
    }

    // Function to delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }

    // Function to clear completed tasks
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }

    // Function to open the edit modal
    function openEditModal(task) {
        currentEditTaskId = task.id;
        editTaskInput.value = task.text;
        editTaskPriority.value = task.priority;
        editTaskDueDate.value = task.dueDate;
        editTaskCategory.value = task.category;
        editModal.classList.add('show');
    }

    // Function to save the edited task
    function saveEditedTask() {
        if (currentEditTaskId) {
            tasks = tasks.map(task => {
                if (task.id === currentEditTaskId) {
                    return {
                        ...task,
                        text: editTaskInput.value.trim(),
                        priority: editTaskPriority.value,
                        dueDate: editTaskDueDate.value,
                        category: editTaskCategory.value
                    };
                }
                return task;
            });

            saveTasks();
            renderTasks();
            editModal.classList.remove('show');
            currentEditTaskId = null;
        }
    }

    // Function to update the task count
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
    }

    // Function to save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Helper function to capitalize the first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Helper function to format date
    function formatDate(dateString) {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    // Helper function to get due date class
    function getDueDateClass(dateString) {
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        if (dueDate < today) {
            return 'overdue';
        } else if (dueDate < dayAfterTomorrow) {
            return 'due-soon';
        } else {
            return 'due-date';
        }
    }
});