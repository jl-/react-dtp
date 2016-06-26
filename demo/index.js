import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import ReactDTP from '../src';
import './index.scss';
const REDAL_REF = Symbol('redal');

class Demo extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {};
    this.handleChange = ::this.handleChange;
  }
  handleChange(value) {
    console.log(value);
    this.setState({ value });
  }
  render() {
    const { value } = this.state;
    return (
      <div>
        <ReactDTP
          onChange={this.handleChange}
        />
        <p>{value && value.toString()}</p>
      </div>
    );
  }
}

ReactDOM.render(
  <Demo></Demo>
  ,document.querySelector('#demo')
);

