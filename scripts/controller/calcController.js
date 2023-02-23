class CalcController {
    // Método constrcutor, que possui os principais atributos e métodos de inicialização
    constructor(){
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '+';
        this._lastNumber = '0';
        this._operation = [];
        this._locale = "pt-br";
        this._displayCalcEl =  document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonEvents();
        this.initKeyboard();
        this.copyToClipboard();
    }

    // Método que permite ao usuário copiar um número digitado
    copyToClipboard(){
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);
        input.select();
        document.execCommand("Copy");
        input.remove();
    }

    // Método que permite ao usuário colar um número na calculadora
    pasteFromClipboard(){
        document.addEventListener('paste', e => {
           let text = e.clipboardData.getData('Text');
           console.log(text)

           this.displayCalc = parseFloat(text)
        })
    }

    // Método que inicializa a calculadora (mostra data e hora, zera o display, etc)
    initialize(){
        this.setDisplayDateTime();

        setInterval(() => {

            this.setDisplayDateTime();

        }, 1000)

        this.displayCalc = "0";
        this.pasteFromClipboard();

        document.querySelectorAll(".btn-ac").forEach((btn) => {
            btn.addEventListener('dblclick', e => {
                this.toggleAudio();
            })
        })
    }

    // Método de toggle que funciona como um interruptor, para ativar e desativar o áudio
    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
    }

    // Método que toca o áudio quando o toggle está on
    playAudio(){
        if (this._audioOnOff){
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    // Método que escuta as teclas que o usuário pressiona. 
    // Se for um número, insere esse número na calculadora.
    initKeyboard(){
        document.addEventListener('keyup', e => {
            this.playAudio();
            switch(e.key){
                
                case "Escape":
                    this.clearAll();
                    break

                case "Backspace": 
                    this.clearEntry();
                    break

                case "+":
                case "-":
                case "*":
                case "/":
                case "%":
                    this.addOperation(e.key)
                    break

                case ".":
                case ",":
                    this.addDot('.')
                    break
    
                case "Enter":
                case "=":
                    this.calc();
                    break
            
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key))
                    break

                case "C":
                    if (e.ctrlKey) this.copyToClipboard();
                    break
            }
        })
    }

    // Método que permite escutar mais de um evento em um elemento
    addEventListenerAll(element, events, fn){
        events.split(" ").forEach((event) => {

            element.addEventListener(event, fn, false);

        })
    }

    // Método que limpa a calculadora, acionado quando o usuário tecla AC.
    clearAll(){
        this._operation = [];
        this.displayCalc = "0";
    }

    // Método que limpa a entrada (remove apenas o último número digitado)
    // Acionado quando o usuário digita CE.
    clearEntry(){
        this._operation.pop();
    }

    // Método que obtém o último item do array de operações (último número ou operador)
    getLastOperation(){
        return this._operation[this._operation.length-1]
    }

    // Método que permite manipular o último item do array de operações
    setLastOperation(value){
        this._operation[this._operation.length-1] = value
    }

    // Método que verifica se aquilo que o usuário digitou é um operador ou não.
    isOperator(value){
        return (['-', '+', '*', '/', '%'].indexOf(value) > -1)
    }

    // Método que adiciona um item ao array de operações
    pushOperation(value){
        this._operation.push(value)

        if (this._operation.length > 3){
            this.calc();
        }
    }

    // Método que transforma o array de operações em string e realiza o cálculo
    getResult(){
        try{
            return eval(this._operation.join(""));
        } catch (error){
            setTimeout(() => {
                this.setError();
            }, 1)
        }
    }

    // Método que obtém o último operador ou número que o usuário digitou
    getLastItem(isOperator = true){
        let lastItem;

        for (let i = this._operation.length-1; i>=0; i--){
            if (this.isOperator(this._operation[i] == isOperator)){
                lastItem = this._operation[i]
                break;
            }
        }

        if (!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber
        }

        return lastItem
    }

    // Método que já realiza o cálculo assim que o usuário digitar 3 itens (num, operador, num)
    calc(){
        let last = '';
        this._lastOperator = this.getLastItem()
        
        if(this._operation.length < 3){
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber]
        }

        if (this._operation.length > 3){
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        } else if (this._operation.length == 3){
            this._lastNumber = this.getLastItem(false)
            this._lastOperator = this.getLastItem();
        }

        let result = this.getResult();

        if (last === "%"){
            result = result / 100;
            this._operation = [result]
        } else {
        this._operation = [result];

        if (last) this._operation.push(last);
        }
        this.setLastNumberToDisplay()
    }

    // Método que mostra o último número digitado pelo usuário na calculadora
    setLastNumberToDisplay(){
        let lastNumber = this.getLastItem(false);

        for (let i = this._operation.length-1; i>=0; i--){
            if(!this.isOperator(this._operation[i])){
                lastNumber = this._operation[i]
                break;
            }
        }
        if (!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }

    addOperation(value){
        if (isNaN(this.getLastOperation())){
           if (this.isOperator(value)){
                this.setLastOperation(value)
           } else if (isNaN(value)){
                console.log(value)
           } else {
                this.pushOperation(value)
                this.setLastNumberToDisplay();
           }

        } else {
            if(this.isOperator(value)){
                this.pushOperation(value)
            } else {
                let newValue = this.getLastOperation().toString() + value.toString()
                this.setLastOperation(newValue);
                this.setLastNumberToDisplay();
            } 
        }

        console.log(this._operation)
    }

    // Método que trata de números decimais, quando o usuário digita ponto (.)
    addDot(){

        let lastOperation = this.getLastOperation();
       
        if (typeof lastOperation === "string" && lastOperation.split("").indexOf(".") > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation("0.");
        } else {
            this.setLastOperation(lastOperation.toString() + ".")
        }
        this.setLastNumberToDisplay();
    }

    // Método usado para disparar um erro na calculadora
    setError(){
        this.displayCalc = "Error"
    }

    // Método que configura os botões disponíveis na calculadora e determina
    // o método que cada um deve realizar quando clicado.
    execBtn(value){

        this.playAudio();

        switch(value){
            
            case "ac":
                this.clearAll();
                break

            case "ce": 
                this.clearEntry();
                break

            case "soma":
                this.addOperation('+')
                break
            
            case "subtracao":
                this.addOperation('-')
                break

            case "multiplicacao":
                this.addOperation('*')
                break

            case "divisao":
                this.addOperation('/')
                break

            case "porcento":
                this.addOperation('%')
                break

            case "ponto":
                this.addDot('.')
                break

            case "igual":
                this.calc();
                break

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value))
                break

            default:
                this.setError();
                break
        }
    }

    // Método que adiciona eventos nos botões
    initButtonEvents(){
        let buttons = document.querySelectorAll("#buttons > g");

        buttons.forEach((btn) => {
            this.addEventListenerAll(btn, 'click drag', (e) => {
                let textBtn = btn.className.baseVal.replace("btn-", "")
                this.execBtn(textBtn)
            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer"
            })
        });
    };

    // Método que imprime a data e hora na calculadora
    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        })
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale)
    }

    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(valor){
        return this._timeEl.innerHTML = valor;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(valor){
        return this._dateEl.innerHTML = valor
    }

    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(valor){
        if (valor.toString().length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = valor;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(valor){
        this._currentDate = valor;
    }
}