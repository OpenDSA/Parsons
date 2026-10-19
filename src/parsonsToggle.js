export default class ParsonsToggle {
    static toggleCount = 0;       
    constructor({start_index, end_index, values}, line){
        ParsonsToggle.toggleCount++;

        this.line = line;
        this.id = "toggle" + ParsonsToggle.toggleCount;
        this.values = values;
        // Starts on a random value, not always values[0] - otherwise
        // every toggle in every rendering defaults to the same option,
        // which a student can learn to exploit as a shortcut regardless
        // of what's actually correct.
        this.currentIndex = Math.floor(Math.random() * this.values.length);

        this.start_index = start_index;
        this.end_index = end_index;

        this.button = document.createElement('button');
        this.button.id = this.id;
        this.button.textContent = this.values[this.currentIndex];

    }

    nextValue(){
        this.currentIndex++;
        return this.values[(this.currentIndex) % this.values.length]
    }

    attachListeners(){
        const toggleButton = document.getElementById(this.id);
        toggleButton.addEventListener('click', () => {
            toggleButton.textContent = this.nextValue();

            const oldEndIndex = this.end_index
            this.end_index = this.start_index + toggleButton.textContent.length;
            this.line.updateText(toggleButton.textContent, this.start_index, oldEndIndex);
        });
    }
}
