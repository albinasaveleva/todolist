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
        this.lastCheck = null;
        this.firstCheck = null;
        this.shiftKeyDown = false;
        this.inBetween = false;
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
        }, 50);
    }
    completedItem(key) {
        this.animateHidding(key, () => {
            this.todoData.get(key).completed = !this.todoData.get(key).completed;
            this.render();
        }, 50);
    }
    checkPoints(target, key) {
        let _this = this.todoData.get(key);
        target.style.backgroundImage = !_this.completed ? 'url("../img/check.png")' : 'url("../img/uncheck.png")';
        _this.completed = !_this.completed;
        if (!this.firstCheck) {
            this.firstCheck = _this;
        } else {
            this.lastCheck = _this;
        }
        
    }
    completedItems() {
        [...this.todoData].forEach(item => {
            if (this.firstCheck.completed && this.lastCheck.completed) {
                if (item[1] === this.firstCheck || item[1] === this.lastCheck) {
                    this.inBetween = !this.inBetween;
                }
                if (this.inBetween) {
                    item[1].completed = true;
                }
            } else if (!this.firstCheck.completed && !this.lastCheck.completed) {
                if (item[1] === this.firstCheck || item[1] === this.lastCheck) {
                    this.inBetween = !this.inBetween;
                }
                if (this.inBetween) {
                    item[1].completed = false;
                }
            }
        }) 
    }
    // completedItems(target, key) {
    //     let _this = this.todoData.get(key);
    //     target.style.backgroundImage = !_this.completed ? 'url("../img/check.png")' : 'url("../img/uncheck.png")';
    //     _this.completed = !_this.completed;
    //     if (_this.completed) {
    //         [...this.todoData].forEach(item => {
    //             if (item[1] === _this && this.lastCheck || item[1] === this.lastCheck) {
    //                 this.inBetween = !this.inBetween;
    //             }
    //             if (this.inBetween) {
    //                 item[1].completed = true;
    //             }
    //         }) 
    //         this.lastCheck = _this;
    //     } 
    //     else {
    //         [...this.todoData].forEach(item => {
    //             if (item[1] === _this && this.lastCheck || item[1] === this.lastCheck) {
    //                 this.inBetween = !this.inBetween;
    //             }
    //             if (this.inBetween) {
    //                 item[1].completed = false;
    //             }
    //         }) 
    //         this.lastCheck = _this;
    //     }
    // }
    handler() {
        this.container.addEventListener('click', (event) => {
            let target = event.target;
            if (target.matches('.todo-remove')) {
                target = target.parentElement;
                this.deleteItem(target.parentElement.getAttribute('data-key'));
            } else if (target.matches('.todo-complete')) {
                target = target.parentElement;
                if (this.shiftKeyDown) {
                    this.checkPoints(target.lastElementChild, target.parentElement.getAttribute('data-key'));
                    // this.completedItems(target.lastElementChild, target.parentElement.getAttribute('data-key'));
                } else {
                    this.completedItem(target.parentElement.getAttribute('data-key'));
                }
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
        document.addEventListener('keydown', () => {
            this.shiftKeyDown = true;
        });
        document.addEventListener('keyup', () => {
            if (this.firstCheck && this.lastCheck) {
                this.completedItems();
            }
            this.render();
            this.firstCheck = null;
            this.lastCheck = null;
            this.shiftKeyDown = false;
            this.inBetween = false;
        })
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