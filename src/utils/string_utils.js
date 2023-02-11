String.prototype.InsertTextStyle = function (value_to_insert, selection, is_link = false, url = null) {
  const start = selection.start
  const end = selection.end + 1
  let result = ''
  
  if (start === end) {
    result = `${this.slice(0, start)}${value_to_insert}${this.slice(end - 1)}`
  }
  else {
    const beginning_text = this.slice(0, start)
    const selected_text = this.slice(start, end - 1)
    const remaining_text = this.slice(end - 1)
  
    if (is_link) {
      const link_text = `[${selected_text}](${url || ''})`
      result = `${beginning_text}${link_text}${remaining_text}`
    }
    else {
      result = `${beginning_text}${value_to_insert}${selected_text}${value_to_insert}${remaining_text}`
    }
  }
  
  return result;
}