export default class ParsonsToggle {
    static toggleCount = 0;       
    constructor({start_index, end_index, values}, line){
        ParsonsToggle.toggleCount++;

        this.line = line;
        this.id = "toggle" + ParsonsToggle.toggleCount;
        this.values = values;
        this.currentIndex = 0;

        this.start_index = start_index;
        this.end_index = end_index;

        this.button = document.createElement('button');
        this.button.id = this.id;
        this.button.textContent = this.values[0];
    }

    nextValue(){
        this.currentIndex++;
        return this.values[(this.currentIndex) % this.values.length]
    }

    attachListeners(){
        const toggleButton = document.getElementById(this.id);
        toggleButton.addEventListener('click', () => {
            toggleButton.textContent = this.nextValue();
            this.line.updateText();
        });
    }
}
