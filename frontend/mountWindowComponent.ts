import { Component, createElement, render } from "./lib/react.ts";

declare namespace document {
  function getElementById(id: string): any;
}

export function mountWindowComponent(windowComponent: new (props: {}) => Component) {
  render(createElement(windowComponent), document.getElementById("root"));
}
