export default class SortableTable {

  constructor(headerConfig = [], data = []) {

    this.headerConfig = headerConfig;
    this.data = data;
    
    this._createElement();
    this.subElements = this._getSubElements(this.element);
  }

  _createElement() {
    this.element = document.createElement('div');
    this.element.className = "sortable-table";
    this.element.innerHTML = this._createTemplate();

  }

  _getSubElements(element) {

    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }
  
  _createTemplate() {
    return `
    <div data-element="header" class="sortable-table__header sortable-table__row">
      ${this._createHeader().join('')}
    </div>

    <div data-element="body" class="sortable-table__body">
    ${this._createData().join('')}
      
    </div>

    <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      <div>
        <p>No products satisfies your filter criteria</p>
        <button type="button" class="button-primary-outline">Reset all filters</button>
      </div>
    </div>`;
  }

  _createHeader() {

    return this.headerConfig.map(({id, title, sortable})=>`
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="">
        <span>${title}</span>
      </div>`);

  }

  _createCells(row) {

    return this.headerConfig.map((config)=>
    {
      if (config['template']) {       
        return config['template'](row[config['id']]);
      }
      
      return `<div class="sortable-table__cell">${row[config['id']]}</div>`;
    });
  }

  _createRow(row) {

    const rowElement = document.createElement('a');
    rowElement.className = "sortable-table__row";
    rowElement.innerHTML = this._createCells(row).join('');
    
    return rowElement.outerHTML;
  }

  _createData() {

    return this.data.map((row)=>this._createRow(row));
  }

  sort(id, order) {

    const sortingHeader = this.headerConfig.filter(conf => conf['id'] == id)[0];
    let sortDesc; let sortAsc;

    if (sortingHeader['sortType'] == 'string') {

      const locales = ["ru", "en"];
      const options = { sensitivity: "variant", caseFirst: "upper" };
      const collator = new Intl.Collator(locales, options);

      sortDesc = (a, b) => collator.compare(b[id], a[id]);
      sortAsc = (a, b) => collator.compare(a[id], b[id]);

    } else if (sortingHeader['sortType'] == 'number') {

      sortDesc = (a, b) => {return b[id] - a[id];};
      sortAsc = (a, b) => {return a[id] - b[id];};

    }

    if (order == 'desc') {
      this.data = [...this.data].sort(sortDesc);
    } else if (order == 'asc') {
      this.data = [...this.data].sort(sortAsc);
    }
    this._updateFields();
  }

  _updateFields() {
    this.subElements.header.innerHTML = this._createHeader().join('');
    this.subElements.body.innerHTML = this._createData().join('');
  }

  render() {
    this._updateFields();
  }

  remove() {

    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}