
export default class ParsonsTextInput {
    static textCount = 0;       
    constructor(){
        ParsonsTextInput.textCount++;
        this.id = "text_input" + ParsonsTextInput.textCount;
        this.htmlContent = `<input type="text" id="${this.id}"/>`
    }
}
