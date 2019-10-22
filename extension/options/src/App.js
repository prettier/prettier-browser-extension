import { Field, Form, Formik } from "formik";
import React from "react";

const defaultOptions = {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: false,
  trailingComma: "none",
  bracketSpacing: true,
  jsxBracketSameLine: false,
  arrowParens: "avoid"
};

function App() {
  return (
    <>
      <h1>
        <a href="https://prettier.io/docs/en/options.html">Prettier Options</a>
      </h1>
      <Formik initialValues={defaultOptions}>
        <Form>
          <hr />
          <label>Print width</label>
          <Field type="number" name="printWidth" />
          <p>Specify the line length that the printer will wrap on.</p>
          <hr />
          <label>Tab width</label>
          <Field type="number" name="tabWidth" />
          <p>Specify the number of spaces per indentation-level.</p>
          <hr />
          <label>Use tabs</label>
          <Field type="checkbox" name="useTabs" />
          <p>Indent lines with tabs instead of spaces.</p>
          <hr />
          <label>Semicolons</label>
          <Field type="checkbox" name="semi" />
          <p>Print semicolons at the ends of statements.</p>
          <hr />
          <label>Use single quotes</label>
          <Field type="checkbox" name="singleQuote" />
          <p>
            Use {"'"}single{"'"} quotes instead of {'"'}double{'"'} quotes.
          </p>
          <hr />
          <label>Trailing commas</label>
          <Field component="select" name="trailingComma">
            <option>none</option>
            <option>es5</option>
            <option>all</option>
          </Field>
          <p>Print trailing commas wherever possible.</p>
          <hr />
          <label>Bracket spacing</label>
          <Field type="checkbox" name="bracketSpacing" />
          <p>Print spaces between brackets in object literals.</p>
          <hr />
          <label>JSX Brackets</label>
          <Field type="checkbox" name="jsxBracketSameLine" />
          <p>
            Put the `{">"}` of a multi-line JSX element at the end of the last
            line instead of being alone on the next line.
          </p>
          <hr />
          <label>Arrow Function Parentheses</label>
          <Field component="select" name="arrowParens">
            <option>avoid</option>
            <option>always</option>
          </Field>
          <p>Include parentheses around a sole arrow function parameter.</p>
        </Form>
      </Formik>
    </>
  );
}

export default App;
