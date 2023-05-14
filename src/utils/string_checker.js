class StringChecker {

  _validate_email = (value) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(value);
  }

  _validate_is_token = (value) => {
    const is_email = this._validate_email(value)
    return !is_email && value.length === 20
  }

  _validate_url = (value) => {
    var re = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?(\?\S*)?(#[^\s]*)?$/
    return re.test(value);
  }

}
export default new StringChecker()