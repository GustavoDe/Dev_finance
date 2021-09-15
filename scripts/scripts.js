function Modal() {
    document.querySelector(".modal-overlay").classList.toggle
        ("active")
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),
    //adicionar transações
    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },
    //remover transações
    remove(index){
        Transaction.all.splice(index, 1)
        App.reload()
    },
    //somar entradas
    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income
    },
    //somar saidas
    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense

    },
    //entradas - saidas
    total() {

        return Transaction.incomes() + Transaction.expenses()
    }
}

//puxando dados
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction)

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount >= 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
        const html = ` 
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
            <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="remover transação">
            </td>
        `

        return html
    },

    updateBalance() {
        document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

//formatação para a moeda brasileira
const Utils = {
    formatAmount(value){
        value = Number(value) * 100
        return value
    },
    
    formatDate(date){
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";
        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {
    //pegando os campos
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    //pegando somente os valores dos campos
    getValues(){
        return{
        description: Form.description.value,
        amount: Form.amount.value,
        date: Form.date.value
        }
    },
    //validar campos
    validateField(){
        const {description, amount, date} = Form.getValues();
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error("Por favor preencha todos os campos")
        }
    },
    formatValues(){
        let {description, amount, date} = Form.getValues();
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    saveTransaction(transaction){
        Transaction.add(transaction)
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event){
        event.preventDefault();
        //validar os campos
       
        try {
            //validação de dados
            Form.validateField();
            //formatar os dados
            const transaction = Form.formatValues();
            //salvar transação
            Form.saveTransaction(transaction);
            //Apagar dados do formulário
            Form.clearFields()
            //fechar modal
            Modal()

        } catch (error) {
            alert(error.message)
        }

    }
}
//guardar prefêrencias do usuario no navegador



const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction);
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init();
    },
}
App.init()
