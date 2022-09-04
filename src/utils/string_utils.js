String.prototype.InsertTextStyle = function (value_to_insert, selection, is_link = false, url = null) {
  const start = selection.start
  const end = selection.end + 1
  const selection_count = selection.end - selection.start
  if (selection.start === selection.end) {
    return this.slice(0, start) + value_to_insert + this.slice(end - 1)
  }
  else {
    const beginning_text = this.slice(0, start)
    const selection = this.slice(start, (start + selection_count))
    const remaining_text = this.slice(start + Math.abs((end - 1) - start))
    if (is_link) {
      const link_text = `[${selection}](${url !== null ? url : ""})`
      return beginning_text + link_text + remaining_text
    }
    else {
      return beginning_text + value_to_insert + selection + value_to_insert + remaining_text
    }
    
  }
}