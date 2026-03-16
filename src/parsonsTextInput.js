export default class ParsonsTextInput {
    static textCount = 0;       
    constructor({start_index, end_index, inner_content}){
        ParsonsTextInput.textCount++;
        this.id = "text_input" + ParsonsTextInput.textCount;
        this.inner_content = inner_content;
        
        this.start_index = start_index
        this.end_index = end_index

        this.text_input = document.createElement('input');
        this.text_input.type = 'text';
        this.text_input.defaultValue = this.inner_content;
        console.log(this.text_input);
    }
}
