export default class ParsonsTextInput {
    static textCount = 0;       
    constructor({start_index, end_index, inner_content}, line){
        ParsonsTextInput.textCount++;
        this.line = line;
        this.id = "text_input" + ParsonsTextInput.textCount;
        this.inner_content = inner_content;
        
        this.start_index = start_index;
        this.end_index = end_index;

        this.text_input = document.createElement('input');
        this.text_input.id = this.id;
        this.text_input.type = 'text';
        this.text_input.defaultValue = this.inner_content;
    }

    attachListeners(){
        const textInput = document.getElementById(this.id);

        //update line text when entering into text input
        textInput.addEventListener('input', (event) => {
            const newText = event.target.value;
            const oldEndIndex = this.end_index;
            const oldInnerContent = this.inner_content;

            this.end_index = oldEndIndex + (newText.length - oldInnerContent.length);
            this.inner_content = newText;
            this.line.updateInputText(event.target.value, this.start_index, oldEndIndex);
        });
    }
}
