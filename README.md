```
npm i redal-dtp --save
```

---
```javascript
import React, { Component } from 'react';
import DatetimePicker from 'react-dtp';

class Demo extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleChange = ::this.handleChange;
  }
  handleChange(value) {
    console.log(value);
  }
  render() {
    const { value } = this.state;
    return (
      <DatetimePicker
        onChange={this.handleChange}
      />
    );
  }
}
```


```
<DatetimePicker
  onChange // function(date),
  date // optional, instanceof Date. If omitted, default to current
/>
```
