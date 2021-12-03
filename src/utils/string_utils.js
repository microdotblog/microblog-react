String.prototype.InsertTextStyle = function (value_to_insert, selection, is_link = false) {
  const start = selection.start
  const end = selection.end + 1
  const selection_count = selection.end - selection.start
  if (selection.start === selection.end) {
    if (is_link) {
      return this.slice(0,start) + value_to_insert + "()" + this.slice(end - 1)
    }
    else {
      return this.slice(0,start) + value_to_insert + this.slice(end - 1)
    }
    
  }
  else {
    const beginning_text = this.slice(0, start)
    const selection = this.slice(start, (start + selection_count))
    const remaining_text = this.slice(start + Math.abs(end - start))
    if (is_link) {
      return beginning_text + "[" + selection + "]() " + remaining_text
    }
    else {
      return beginning_text + value_to_insert + selection + value_to_insert + " " + remaining_text
    }
    
  }
}