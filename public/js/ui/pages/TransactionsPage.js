/**
 * Класс TransactionsPage управляет
 * страницей отображения доходов и
 * расходов конкретного счёта
 * */
class TransactionsPage {
  /**
   * Если переданный элемент не существует,
   * необходимо выкинуть ошибку.
   * Сохраняет переданный элемент и регистрирует события
   * через registerEvents()
   * */
  constructor( element ) {
    if (!element) {
      throw new Error('Error: no element in class TransactionsPage');
    }
    this.element = element;
    this.registerEvents();
  }

  /**
   * Вызывает метод render для отрисовки страницы
   * */
  update() {
    this.render(this.lastOptions);
  }

  /**
   * Отслеживает нажатие на кнопку удаления транзакции
   * и удаления самого счёта. Внутри обработчика пользуйтесь
   * методами TransactionsPage.removeTransaction и
   * TransactionsPage.removeAccount соответственно
   * */
  registerEvents() {
    const removeAccBtn = document.querySelector('.remove-account');
    const content = this.element.querySelector('.content');

    removeAccBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.removeAccount();
    })

    content.addEventListener('click', (e) => {
      e.preventDefault();
      const removeTrBtn = e.target.closest('.transaction__remove');
      if (removeTrBtn) {
        this.removeTransaction(removeTrBtn.dataset.id);
      }
    })
  }

  /**
   * Удаляет счёт. Необходимо показать диаголовое окно (с помощью confirm())
   * Если пользователь согласен удалить счёт, вызовите
   * Account.remove, а также TransactionsPage.clear с
   * пустыми данными для того, чтобы очистить страницу.
   * По успешному удалению необходимо вызвать метод App.updateWidgets() и App.updateForms(),
   * либо обновляйте только виджет со счетами и формы создания дохода и расхода
   * для обновления приложения
   * */
  removeAccount() {
    if (!this.lastOptions) {
      return;
    }
    const data = {id: this.lastOptions.account_id};

    if (confirm('Вы действительно хотите удалить счёт?')) {
      Account.remove(data, (err, response) => {
        if (response.success) {
          this.clear();
          App.update();
        }
      })
    }
    
  }

  /**
   * Удаляет транзакцию (доход или расход). Требует
   * подтверждеия действия (с помощью confirm()).
   * По удалению транзакции вызовите метод App.update(),
   * либо обновляйте текущую страницу (метод update) и виджет со счетами
   * */
  removeTransaction( id ) {
    const data = {id}
    if (confirm('Вы действительно хотите удалить эту транзакцию?')) {
      Transaction.remove(data, (er, response) => {
        if (response.success) {
          App.update();
        }
      })
    }
  }

  /**
   * С помощью Account.get() получает название счёта и отображает
   * его через TransactionsPage.renderTitle.
   * Получает список Transaction.list и полученные данные передаёт
   * в TransactionsPage.renderTransactions()
   * */
  render(options){
    if (!options) {
      return;
    }
    this.lastOptions = options;

    Account.get(options.account_id, (err, response) => {
      if (response.success) {
        this.renderTitle(response.data.name);
      }
    });

    Transaction.list(options, (err, response) => {
      if (response.success) {
        this.renderTransactions(response.data);
      }
    });
  }

  /**
   * Очищает страницу. Вызывает
   * TransactionsPage.renderTransactions() с пустым массивом.
   * Устанавливает заголовок: «Название счёта»
   * */
  clear() {
    this.renderTransactions([]);
    this.renderTitle('Название счета');
    this.lastOptions = '';
  }

  /**
   * Устанавливает заголовок в элемент .content-title
   * */
  renderTitle(name){
    this.element.querySelector('.content-title').textContent = name;
  }

  /**
   * Форматирует дату в формате 2019-03-10 03:20:41 (строка)
   * в формат «10 марта 2019 г. в 03:20»
   * */
  formatDate(date){
    const dateStr = new Date(date);
    const dateNoun = dateStr.toLocaleString('ru', {year: 'numeric', month: 'long', day: 'numeric'});
    const time = dateStr.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    return `${dateNoun} в ${time}`;
  }

  /**
   * Формирует HTML-код транзакции (дохода или расхода).
   * item - объект с информацией о транзакции
   * */
  getTransactionHTML(item){
    const dateForAns = this.formatDate(item.created_at);
    const elementHTMl = `<div class="transaction transaction_${item.type} row">
    <div class="col-md-7 transaction__details">
      <div class="transaction__icon">
          <span class="fa fa-money fa-2x"></span>
      </div>
      <div class="transaction__info">
          <h4 class="transaction__title">${item.name}</h4>
          <!-- дата -->
          <div class="transaction__date">${dateForAns}</div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="transaction__summ">
      <!--  сумма -->
          ${(item.sum).toLocaleString('en')} <span class="currency">₽</span>
      </div>
    </div>
    <div class="col-md-2 transaction__controls">
        <!-- в data-id нужно поместить id -->
        <button class="btn btn-danger transaction__remove" data-id="${item.id}">
            <i class="fa fa-trash"></i>  
        </button>
    </div>
</div>`
    
  return elementHTMl;
  }

  /**
   * Отрисовывает список транзакций на странице
   * используя getTransactionHTML
   * */
  renderTransactions(data){
    const content = this.element.querySelector('.content');
    content.innerHTML = '';

    data.forEach(item => content.insertAdjacentHTML('beforeend', this.getTransactionHTML(item)));
  }
}