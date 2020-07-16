window.addEventListener('load', function () {
    var vm = new Vue({
        delimiters: ['[[', ']]'],
        el: '#app',
        data: {
            messages: [],
            category: null,
            level: 0,
            question: null,
            json: null,
            custom: false,
            changeLevel: ['Choose a different application'],
            questionHeader: ['Does your query pertain to any of the following applications?', 'Choose an issue']
        },
        methods: {
            //Adds message to the chat interface
            addMessage: function (isUser, isOptions, msg, isAnswer) {
                let path = [this.category,this.question];
                if (isUser) {
                    let message = {
                        "user": true,
                        "bot": false,
                        "text": msg,
                        "options": false
                    };
                    this.messages.push(message);
                } else {
                    if (isAnswer) {
                        this.messages.push(msg);
                    } else if (isOptions) {
                        let message = [];
                        let jsonVal = this.json['categories'];
                        for (let i = 0; i < this.level; i++) {
                            jsonVal = jsonVal[path[i]];
                        }
                        for (keys in jsonVal) {
                            message.push(keys);
                        }
                        for (let i = 0; i < this.level; i++) {
                            message.push(this.changeLevel[i]);
                        }
                        let message1 = {
                            "user": false,
                            "bot": true,
                            "isAnswer": false,
                            "text": message,
                            "options": true
                        };
                        this.addMessage(false, false, this.questionHeader[this.level]);
                        this.messages.push(message1);
                    } else {
                        let message1 = {
                            "user": false,
                            "bot": true,
                            "isAnswer": false,
                            "text": msg,
                            "options": false
                        };
                        this.messages.push(message1);
                    }
                }
            },
            //Sets the category when user clicks a button
            setCategory: function (category) {
                this.messages.pop();
                this.addMessage(true, false, category);
                switch (category) {
                    case this.changeLevel[0]:
                        this.level = 0;
                        this.addMessage(false, true);
                        return;
                    case this.changeLevel[1]:
                        this.level = 1;
                        this.addMessage(false, true);
                        return;
                    case this.changeLevel[2]:
                        this.level = 2;
                        this.addMessage(false, true);
                        return;
                }
                if (category !== 'Ask your own question') {
                    switch (this.level) {
                        case 0:
                            this.category = category;
                            break;
                        case 1:
                            this.getAnswer(null, category);
                            return;
                    }
                    this.level++;
                    // this.isOptions = true;
                } else {
                    this.custom = true;
                    return;
                }
                this.addMessage(false, true);
            },
            //Retrieves answer from the server
            getAnswer: function (event, input) {
                this.custom = false;
                let question = {};
                if (event) {
                    question['question'] = event.question.value;
                    this.addMessage(true, false, question['question'], false);

                } else {
                    question['question'] = input;
                }
                question = JSON.stringify(question);
                let csrftoken = $('[name=csrfmiddlewaretoken]').val();
                const init = {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    body: question
                };
                fetch('/bot/getAnswer/', init).then(data => data.json()).then(data => {
                    let answer = data;
                    this.addMessage(false, false, "Here's what I got for you!");
                    let message = {
                        "user": false,
                        "bot": true,
                        "options": false,
                        "isAnswer": true,
                        "title": answer
                    };
                    this.addMessage(false, false, message, true);
                    this.addMessage(false, true);
                });
            },
            saveLogFile:function(){
               //changes to be done here
               console.log('working')
                let csrftoken = $('[name=csrfmiddlewaretoken]').val();
                let data = JSON.stringify(this.messages);
                const init = {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    body: data
                };
                fetch('/bot/saveLog/', init).then(function (response) {
                    return response.blob();
                }).then(function (blob) {
                    let a = document.createElement('a');
                    a.style.display = 'none';
                    const objectURL = window.URL.createObjectURL(blob);
                    a.href = objectURL;
                    document.body.appendChild(a);
                    //a.download = 'chatlog.txt';
                    //a.click();
                    setTimeout(function () {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(objectURL);
                    }, 100);
                });
            },
            //Retrieves the chatlog from the server
            getLogFile: function () {
                let csrftoken = $('[name=csrfmiddlewaretoken]').val();
                let data = JSON.stringify(this.messages);
                const init = {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    body: data
                };
                fetch('/bot/createLog/', init).then(function (response) {
                    return response.blob();
                }).then(function (blob) {
                    let a = document.createElement('a');
                    a.style.display = 'none';
                    const objectURL = window.URL.createObjectURL(blob);
                    a.href = objectURL;
                    document.body.appendChild(a);
                    a.download = 'chatlog.txt';
                    a.click();
                    setTimeout(function () {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(objectURL);
                    }, 100);
                });
            },
            thankyou: function () {
                window.location.replace('/bot/thankyou/');
            }
        },
        created: function () {
            fetch('/static/json/queries.json').then(data => data.json()).then(data => {
                this.json = data;
                this.addMessage(false, false, "Hi! My name is support bot and I'm a chatbot. I can help you with application support related queries. Please select a quick link below or type your question in the space provided at the bottom.");
                this.addMessage(false, true);
            });
        }
    });
});
