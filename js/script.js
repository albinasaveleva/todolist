'use strict';

class Todo {
    constructor(container, form, input, addButton, todoList, todoCompleted) {
        this.container = document.querySelector(container);
        this.form = document.querySelector(form);
        this.input = document.querySelector(input);
        this.addButton = document.querySelector(addButton);
        this.todoList = document.querySelector(todoList);
        this.todoCompleted = document.querySelector(todoCompleted);
        this.todoData = new Map(JSON.parse(localStorage.getItem('todoList')));
    } 
    generateKey() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    createItem(todo) {
        const li = document.createElement('li');
        li.classList.add('todo-item');
        li.setAttribute('data-key', todo.key);
        li.insertAdjacentHTML('beforeend', `
            <span class="text-todo">${todo.value}</span>
            <div class="todo-buttons">
            <button class="todo-edit"></button>
            <button class="todo-remove"></button>
            <button class="todo-complete"></button>
            </div>
        `);

        if (todo.completed) {
            this.todoCompleted.append(li);
            return;
        }

        this.todoList.append(li);
    }
    render() {
        this.todoList.textContent = '';
        this.todoCompleted.textContent = '';
        this.todoData.forEach(this.createItem.bind(this));
        this.setStorage();
    }
    addTodo(event) {
        event.preventDefault();
        if (this.input.value.trim()) {
            const newTodo = {
                value: this.input.value,
                completed: false,
                key: this.generateKey(),
            };
            this.todoData.set(newTodo.key, newTodo);
            this.render();
            this.input.value = '';
            return;
        }
        this.input.style.background = 'rgba(250, 128, 114, 0.4)';

        setTimeout(() => this.input.style.background = '', 1000);
    }
    setStorage() {
        localStorage.setItem('todoList', JSON.stringify([...this.todoData]));
    }
    animateHidding(key, callback, time) {
        let opacityCount = 1,
            animateInterval;

        let item = document.querySelector(`[data-key="${key}"]`);
        item.style.opacity = '1';

        const animate = () => {
            animateInterval = requestAnimationFrame(animate);
            if (opacityCount > 0) {
                opacityCount -= 0.25;
                item.style.opacity = opacityCount;
            } 
            else {
                cancelAnimationFrame(animateInterval);
            }
        };
        animateInterval = requestAnimationFrame(animate);
        setTimeout(callback, time);
    }
    editItem(key) {
        let elem = document.querySelector(`[data-key="${key}"]`),
            span = elem.querySelector('span'),
            dataElem = this.todoData.get(key),
            memory = span.textContent;

        const editContent = () => {
            span.removeAttribute('contenteditable');
            if (span.textContent.trim()) {
                dataElem.value = span.textContent;
                this.todoData.set(key, dataElem);
                this.setStorage();
            } else {
                span.textContent = memory;
            }
        };
        span.setAttribute('contenteditable', true);

        elem.addEventListener('blur', editContent);
        elem.addEventListener('keydown', (event) => {
            if (event.code.toLowerCase() === 'enter') {
                editContent();
            }
        });
    }
    deleteItem(key) {
        this.animateHidding(key, () => {
            this.todoData.delete(key);
            this.render();
        }, 500);
    }
    completedItem(key) {
        this.animateHidding(key, () => {
            this.todoData.get(key).completed = !this.todoData.get(key).completed;
            this.render();
        }, 500);
    }
    handler() {
        this.container.addEventListener('click', (event) => {
            let target = event.target;
            if (target.matches('.todo-remove')) {
                target = target.parentElement;
                this.deleteItem(target.parentElement.getAttribute('data-key'));
            } else if (target.matches('.todo-complete')) {
                target = target.parentElement;
                this.completedItem(target.parentElement.getAttribute('data-key'));
            } else if (target.matches('todo-edit')) {
                target = target.parentElement;
                this.editItem(target.parentElement.getAttribute('data-key'));
            }
        });
    }
    init () {
        this.form.addEventListener('submit', this.addTodo.bind(this));
        this.handler();
        this.render();
    }
}

const todo =  new Todo('.todo-container', 
    '.todo-control', 
    '.header-input', 
    '.header-button', 
    '.todo-list', 
    '.todo-completed'
);
todo.init();