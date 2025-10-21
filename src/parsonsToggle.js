export default class ParsonsToggle {
    static toggleCount = 0;       
    constructor(values){
        ParsonsToggle.toggleCount++;
        this.values = values;
        this.id = "toggle" + ParsonsToggle.toggleCount;
        this.currentIndex = 0;
        this.htmlContent = `<button id="${this.id}">${this.values[0]}</button>`;
    }

    nextValue(){
        this.currentIndex++;
        return this.values[(this.currentIndex) % this.values.length]
    }

    attachListeners(){
        const toggleButton = document.getElementById(this.id);
        toggleButton.addEventListener('click', () => {
            toggleButton.textContent = this.nextValue();
        });
    }
}
